// security.js hold the security endpoint

const {
    getFiltersConcat,
    getTypesConcat,
    getQueries
} = require('../utils/metrics');
const {
    connectToES
} = require('../modules/elastic');

let {
    getTimestampBucket,
    timestamp_gte,
    timestamp_lte
} = require('../utils/ts');
const { getJWTsipUserFilter } = require('../modules/jwt');


var timerange_query = require('../../js/template_queries/timerange_query.js');
var geoip = require('../../js/template_queries/geoip_agg_filter.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var agg_filter = require('../../js/template_queries/agg_filter.js');
var agg_filter_animation = require('../../js/template_queries/agg_filter_animation.js');
var geoipAnimation = require('../../js/template_queries/geoip_agg_filter_animation.js');
const agg_query = require('../../js/template_queries/agg_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class securityController {

    /**
     * @swagger
     * /api/security/charts:
     *   post:
     *     description: Get security charts
     *     tags: [Chart]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Call chart form
     *         in: body
     *         required: true
     *         type: object
     *         schema:
     *           $ref: '#/definitions/ChartForm'
     *     responses:
     *       200:
     *         description: return chart data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static getCharts(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: "+domainFilter);
            //SECURITY DISTRIBUTION MAP
            const distribution = geoip.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, 'attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new', domainFilter), supress);

            //EVENT SECURITY  TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), supress);


            //EVENTS BY IP ADDR
            const eventsByIP = agg_filter.getTemplate('attrs.source', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), supress);

            //TOP SUBNETS /24
            const subnets = agg_filter.getTemplate("attrs.sourceSubnets", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), supress);

            //EVENTS BY COUNTRY
            const eventsByCountry = agg_filter.getTemplate('geoip.country_code2', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), supress);

            //TYPES
            const typesCount = agg_query.getTemplate("terms", 'attrs.type', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:auth-failed OR attrs.type:fbl-new OR attrs.type:log-reply OR attrs.type:message-dropped OR attrs.type:fgl-new", domainFilter), supress);

            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    distribution,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsOverTime,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsByIP,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    subnets,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsByCountry,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    typesCount
                ]
            }).catch((err) => {
                /*res.render('error_view', {
                  title: 'Error',
                  error: err
                  });*/
                err.status = 400
                return next(err);
            });

            console.log(new Date + " got elastic data");
            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }


    /**
     * @swagger
     * /api/security/events_by_ip_addr:
     *   post:
     *     description: Get events by IP addr for animation
     *     tags: [Chart]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Call chart form
     *         in: body
     *         required: true
     *         type: object
     *         schema:
     *           $ref: '#/definitions/ChartForm'
     *     responses:
     *       200:
     *         description: return chart data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static getEventsByIP(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }
            if (req.body.timezone) {
                var timezone = req.body.timezone;
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }
            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //EVENTS BY IP ADDR
            const eventsByIP = agg_filter_animation.getTemplate('attrs.source', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsByIP
                ]
            }).catch((err) => {
                err.status = 400
                return next(err);
            });

            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }


    /**
     * @swagger
     * /api/security/top_subnets:
     *   post:
     *     description: Get top subnets events for animation
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Call chart form
     *         in: body
     *         required: true
     *         type: object
     *         schema:
     *           $ref: '#/definitions/ChartForm'
     *     responses:
     *       200:
     *         description: return chart data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static getTopSubnets(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }
            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //TOP SUBNETS /24
            const subnets = agg_filter_animation.getTemplate("attrs.sourceSubnets", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    subnets
                ]
            }).catch((err) => {
                err.status = 400
                return next(err);
            });

            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }


    /**
     * @swagger
     * /api/security/events_by_country:
     *   post:
     *     description: Get events by country for animation
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Call chart form
     *         in: body
     *         required: true
     *         type: object
     *         schema:
     *           $ref: '#/definitions/ChartForm'
     *     responses:
     *       200:
     *         description: return chart data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static getEventsByCountry(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }
            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //EVENTS BY COUNTRY
            const eventsByCountry = agg_filter_animation.getTemplate('geoip.country_code2', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsByCountry
                ]
            }).catch((err) => {
                err.status = 400
                return next(err);
            });

            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }
    static getEventsByCountryLimit(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }
            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //EVENTS BY COUNTRY
            const eventsByCountry = agg_filter_animation.getTemplate('geoip.country_code2', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress, 3);

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsByCountry
                ]
            }).catch((err) => {
                err.status = 400
                return next(err);
            });

            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }


    /**
     * @swagger
     * /api/security/events_by_ip_addr:
     *   post:
     *     description: Get events by IP addr for animation
     *     tags: [Chart]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Call chart form
     *         in: body
     *         required: true
     *         type: object
     *         schema:
     *           $ref: '#/definitions/ChartForm'
     *     responses:
     *       200:
     *         description: return chart data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static getEventsByIP(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //EVENTS BY IP ADDR
            const eventsByIP = agg_filter_animation.getTemplate('attrs.source', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsByIP
                ]
            }).catch((err) => {
                err.status = 400
                return next(err);
            });

            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }


    /**
     * @swagger
     * /api/security/security_geo_events:
     *   post:
     *     description: Get geoip chart
     *     tags: [Chart]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Call chart form
     *         in: body
     *         required: true
     *         type: object
     *         schema:
     *           $ref: '#/definitions/ChartForm'
     *     responses:
     *       200:
     *         description: return chart data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static getGeoip(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";


            const distribution = geoipAnimation.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, 'attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new', domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);


            const response = await client.msearch({
                body: [
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    distribution
                ]
            }).catch((err) => {
                /*res.render('error_view', {
                  title: 'Error',
                  error: err
                  });*/
                err.status = 400
                return next(err);
            });

            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }
    
    /**
 * @swagger
 * /api/security/table:
 *   post:
 *     description: Get data for table
 *     tags: [Chart]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: pretty
 *         description: Return a pretty json
 *         in: query
 *         required: false
 *         type: bool
 *       - name: form
 *         description: Security chart form
 *         in: body
 *         required: true
 *         type: object
 *         schema:
 *           $ref: '#/definitions/ChartForm'
 *     responses:
 *       200:
 *         description: return chart data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TableResponse'
 *       400:
 *         description: elasticsearch error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ChartResponseError'
 */
    static getTable(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }
            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            var data = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), supress);


            const response = await client.search({
                index: 'logstash*',
                "ignore_unavailable": true,
                "preference": 1542895076143,
                body: data

            });
            console.log(new Date + " got elastic data");
            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });


    }

}

module.exports = securityController;
