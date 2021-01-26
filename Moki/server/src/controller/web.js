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
const {getWebFilter} = require('../modules/config');


var geoip = require('../../js/template_queries/geoip_agg_filter.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var datehistogram_query = require('../../js/template_queries/datehistogram_query.js');
var agg_filter = require('../../js/template_queries/agg_filter.js');
var agg_filter_animation = require('../../js/template_queries/agg_filter_animation.js');
var geoipAnimation = require('../../js/template_queries/geoip_agg_filter_animation.js');
const query_string = require('../../js/template_queries/query_string.js');
const distinct_query_string = require('../../js/template_queries/distinct_query_string.js');
const distinct_query_string_animation = require('../../js/template_queries/distinct_query_string_animation.js');

supress = "nofield";
var userFilter = "*";
var domainFilter ="*";

class webController {

    /**
     * @swagger
     * /api/web:
     *   post:
     *     description: Get special charts for web page
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
    static getWebCharts(req, res, next) {
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

            domainFilter = await getWebFilter();
            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: "+domainFilter);

            //EVENT SECURITY  TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOTAL EVENT COUNT
            const eventCount = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //EVENTS BY IP ADDR
            const eventsByIP = distinct_query_string.getTemplate("attrs.source", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //EVENTS BY COUNTRY
            const eventsByCountry = agg_filter.getTemplate('geoip.country_code2', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress, 3);

            //TOP USER AGENTS
            const userAgents = agg_filter.getTemplate('attrs.from-ua', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress, 3);

            //SECURITY DISTRIBUTION MAP
            const distribution = geoip.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, '*', domainFilter), supress);


            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [
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
                    eventCount,
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
                    userAgents,
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
     * /api/web/distinct_ips:
     *   post:
     *     description: Get distinct IP addr for animation
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
    static getDistinctIPs(req, res, next) {
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
            domainFilter = await getWebFilter();
            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //EVENTS BY IP ADDR
            const eventsByIP = distinct_query_string_animation.getTemplate("attrs.source", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);
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
     * /api/web/events:
     *   post:
     *     description: Get events count for animation
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
    static getEventsCount(req, res, next) {
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
            domainFilter = await getWebFilter();
            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //EVENTS 
            const eventCount = datehistogram_query.getTemplate(timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), timestamp_gte, timestamp_lte, supress);
            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventCount
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
     * /api/web/top_user_agents:
     *   post:
     *     description: Get top user agents data
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
    static getTopUserAgents(req, res, next) {
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
            domainFilter = await getWebFilter();
            //video length 30 sec
            var timebucket = (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            //TOP USER AGENTS
            const userAgents = agg_filter_animation.getTemplate('attrs.from-ua', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress, 3);


            const response = await client.msearch({
                body: [
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    userAgents
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
            domainFilter = await getWebFilter();
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
     * /api/web/security_geo_events:
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
            domainFilter = await getWebFilter();
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

}

module.exports = webController;
