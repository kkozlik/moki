// overview.js hold the home endpoint

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

var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var timerange_query = require('../../js/template_queries/timerange_query.js');
var agg_query = require('../../js/template_queries/agg_query.js');
var datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query.js');
var two_agg_query_limit = require('../../js/template_queries/two_agg_query_limit.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class overviewController {

    /**
     * @swagger
     * /api/overview/charts:
     *   post:
     *     description: Get overview charts
     *     tags: [Overview]
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

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: "+domainFilter);


            //EVENT OVERVIEW TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOTAL EVENTS IN INTERVAL
            const totalEvents = agg_query.getTemplate("terms", "attrs.type", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            //ACTIVITY OF SBCS
            const activitySBC = datehistogram_agg_query.getTemplate("attrs.hostname", "terms", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SBC KEEP ALIVE
            const keepAlive = datehistogram_agg_query.getTemplate(
                "attrs.hostname", "terms", timebucket, getQueries(filters, "*", timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            //SBC ACTIVITY TYPES
            const sbcTypes = two_agg_query_limit.getTemplate("attrs.sbc", "terms", "attrs.type", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //list of tags
            const  tags = agg_query.getTemplate("terms", "attrs.tags", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);
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
            totalEvents,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
            activitySBC,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
            keepAlive,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                sbcTypes,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                tags
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
     * /api/overview/table:
     *   post:
     *     description: Get data for table
     *     tags: [Overview]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Overview chart form
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
            console.log("req.body");
            console.log(req.body);

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
            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: "+domainFilter);

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);
            var overview = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del OR attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt OR attrs.type:notice OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:action-log OR attrs.type:message-log OR attrs.type:error OR attrs.type:alert OR attrs.type:fbl-new OR attrs.type:fgl-new OR attrs.type:message-dropped OR attrs.type:recording OR attrs.type:limit OR attrs.type:prompt OR attrs.type:conf-join OR attrs.type:conf-leave", domainFilter), supress);

            const response = await client.search({
                index: 'logstash*',
                "ignore_unavailable": true,
                "preference": 1542895076143,
                body: overview

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

module.exports = overviewController;
