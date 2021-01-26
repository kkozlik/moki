// registration.js hold the registration endpoint

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


const timerange_query = require('../../js/template_queries/timerange_query.js');
const geoip = require('../../js/template_queries/geoip_agg_filter.js');
const datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
const agg_filter = require('../../js/template_queries/agg_filter.js');
const datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
var geoipAnimation = require('../../js/template_queries/geoip_agg_filter_animation.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class registrationController {

    /**
     * @swagger
     * /api/registration/charts:
     *   post:
     *     description: Get registration charts
     *     tags: [Registration]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Registration chart form
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

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: "+ domainFilter);

            //REGISTRATION DISTRIBUTION MAP
            const distribution = geoip.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del", domainFilter), supress);

            //EVENT REGISTRATIONS  TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:reg-new OR attrs.type:reg-del OR attrs.type:reg-expired", domainFilter), supress);

            //USER-AGENTS IN REG. NEW
            const userAgents = agg_filter.getTemplate('attrs.from-ua', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, 'attrs.type:reg-new', domainFilter), supress);

            //TOP REG. EXPIRED
            const topRegExpired = agg_filter.getTemplate("attrs.from.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, 'attrs.type:reg-expired', domainFilter), supress);

            //TRANSPORT PROTOCOL
            const transportProtocol = agg_filter.getTemplate('attrs.transport', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //PARALLEL REGS
            const parallelRegs = datehistogram_agg_query.getTemplate("countReg", "max", timebucket, getQueries(filters, "*", timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //PARALLEL REGS 1 DAY AGO   
            const parallelRegsDayAgo = datehistogram_agg_query.getTemplate("countReg", "max", timebucket, getQueries(filters, "*", (timestamp_gte - 60 * 60 * 24 * 1000), (timestamp_lte - 60 * 60 * 24 * 1000), userFilter, "*", domainFilter), supress);

            //ACTUAL REGS
            const regsActual = agg_query.getTemplate("max", "countReg", getQueries(filters, "*", timestamp_lte - 1 * 60 * 1000, timestamp_lte, userFilter, "*", domainFilter), supress);

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
                    userAgents,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topRegExpired,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    transportProtocol,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    parallelRegs,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    parallelRegsDayAgo,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    regsActual
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
     * /api/registration/registrations_map:
     *   post:
     *     description: Get geoip chart
     *     tags: [Registration]
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
            timebucket = timebucket + "s";

            const distribution = geoipAnimation.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);

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
     * /api/registration/table:
     *   post:
     *     description: Get data for table
     *     tags: [Registration]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Registration chart form
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

            var data = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:reg-new OR attrs.type:reg-del OR attrs.type:reg-expired", domainFilter), supress);


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

module.exports = registrationController;
