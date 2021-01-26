// home.js hold the home endpoint

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

const query_string = require('../../js/template_queries/query_string.js');
const agg_sum_bucket_query = require('../../js/template_queries/agg_sum_bucket_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
const datehistogram_query = require('../../js/template_queries/datehistogram_query.js');
const datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query.js');
const timerange_query = require('../../js/template_queries/timerange_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

/**
 * @swagger
 * tags:
 *   name: Chart
 *   description: Charts management
 */

/**
 * @swagger
 * definitions:
 *   ChartForm:
 *     type: "object"
 *     required:
 *         - filters
 *         - types
 *         - timerange_gte
 *         - timerange_lte
 *     properties:
 *        filters:
 *          description: filters to apply
 *          type: array
 *          items:
 *            $ref: "#/definitions/Filter"
 *        types:
 *          description: types to filter for different dashboards
 *          type: array
 *          items:
 *            $ref: "#/definitions/Type"
 *        timerange_gte:
 *          description: gte time in UNIX timestamp
 *          type: string
 *          example:
 *            timerange_gte: 1592458026000
 *        timerange_lte:
 *          description: lte time in UNIX timestamp
 *          type: string
 *          example:
 *             timerange_lte: 1592479626000
 *   Type:
 *     type: "object"
 *     required:
 *         - id
 *         - name
 *         - state
 *     properties:
 *        id:
 *          description: event type 
 *          type: string
 *          example:
 *            "call-end"
 *        name:
 *          description: User frendly name
 *          type: string
 *          example:
 *            "Call end"
 *        state:
 *          description: state of type filter
 *          type: string
 *          enum:
 *          - "enable"
 *          - "disable"
 *          example:
 *            "enable"
 *   Filter:
 *     type: "object"
 *     required:
 *         - id
 *         - pinned
 *         - state
 *         - title
 *     properties:
 *        id:
 *          description: GUI id 
 *          type: string
 *          example:
 *            1
 *        pinned:
 *          description: if filter should be in every dashboard
 *          type: string
 *          example:
 *            "true"
 *        state:
 *          description: state of type filter
 *          type: string
 *          enum:
 *          - "enable"
 *          - "disable"
 *          example:
 *            "enable"
 *        title:
 *          description: value of filter
 *          type: string
 *          example:
 *            "attrs.sip-code: 408"
 *   ChartResponse:
 *      type: "object"
 *      properties:
 *        responses:
 *          description: returns json array. Length and format depends on dashboard queries. 
 *          type: json
 *          example:
 *            [{took: 85, timed_out: false, _shards: {total: 22, successful: 22, skipped: 0, failed: 0, aggregations: {data}, hits: {data}}},{took: 85, timed_out: false, _shards: {total: 22, successful: 22, skipped: 0, failed: 0, aggregations: {data}, hits: {data}}}, {took: 59, timed_out: false, _shards: {total: 22, successful: 22, skipped: 0, failed: 0, aggregations: {data: data}, hits: {data}}}, {took: 1, timed_out: false, _shards: {total: 22, successful: 22, skipped: 0, failed: 0, aggregations: {data}, hits: {data}}},{took: 49, timed_out: false, _shards: {total: 22, successful: 22, skipped: 0, failed: 0, aggregations: {data}, hits: {data}}}]
 *        took:
 *          description: length of query in ms
 *          type: integer
 *          example:
 *            366
 *   TableResponse:
 *      type: "object"
 *      properties:
 *        hits:
 *          description: returns value array 
 *          type: string
 *          example:
 *            total: {value: 542}
 *        took:
 *          description: length of query in ms
 *          type: integer
 *          example:
 *            366
 *        time_out:
 *          description: if query took too long
 *          type: bool
 *          example:
 *            false
 *   ChartResponseError:
 *      type: "object"
 *      properties:
 *        error:
 *          description: returns ES problem  
 *          type: string
 *      example:
 *         "No Living connections"

 */

class HomeController {

    /**
     * @swagger
     * /api/home/charts:
     *   post:
     *     description: Get home charts
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
     *         description: Home chart form
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
            console.log(`SERVER search with filters: ${filters} types: ${types} ` +
                `timerange: ${timestamp_gte}-${timestamp_lte} ` +
                ` timebucket: ${timebucket} diff: ${(timestamp_lte - timestamp_gte)}`);
            
                var lastTimebucket = "";

                if(timebucket.includes("s")){
                    lastTimebucket = timestamp_lte - (timebucket.slice(0, -1)*1000); 
                }
                else if(timebucket.includes("m")){
                    lastTimebucket = timestamp_lte - (timebucket.slice(0, -1) * 60 * 1000); 
                }
                if(timebucket.includes("h")){
                    lastTimebucket = timestamp_lte - (timebucket.slice(0, -1) * 60*60*1000); 
                }
           

            const sumCallEnd = query_string.getTemplate(
                getQueries(filters, types, timestamp_gte, timestamp_lte,
                    userFilter, "attrs.type:call-end", domainFilter), supress);

            const sumCallAttempt = query_string.getTemplate(
                getQueries(filters, types, timestamp_gte, timestamp_lte,
                    userFilter, "attrs.type:call-attempt", domainFilter), supress);

            const avgFailureRatio = agg_sum_bucket_query.getTemplate(
                "SumFailureSuccess", "failure",
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const durationSum = agg_query.getTemplate(
                "sum", "attrs.duration",
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const answerSeizureRatio = agg_sum_bucket_query.getTemplate(
                "CallEnd", "AnsweredCalls",
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const avgDuration = agg_query.getTemplate(
                "avg", "attrs.duration",
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const typeDateHeatmap = datehistogram_agg_query.getTemplate(
                "attrs.type", "terms", timebucket,
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del OR attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt OR attrs.type:notice OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:action-log OR attrs.type:message-log OR attrs.type:error OR attrs.type:alert OR attrs.type:fbl-new OR attrs.type:fgl-new OR attrs.type:message-dropped OR attrs.type:recording OR attrs.type:limit OR attrs.type:prompt", domainFilter), supress);

            const parallelCalls = datehistogram_agg_query.getTemplate(
                "countCall", "max", timebucket,
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const parallelCallsDayAgo = datehistogram_agg_query.getTemplate(
                "countCall", "max", timebucket,
                getQueries(filters, types, (timestamp_gte - 60 * 60 * 24 * 1000), (timestamp_lte - 60 * 60 * 24 * 1000), userFilter, "*", domainFilter), supress);

            const parallelRegs = datehistogram_agg_query.getTemplate(
                "countReg", "max", timebucket,
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const parallelRegsDayAgo = datehistogram_agg_query.getTemplate(
                "countReg", "max", timebucket,
                getQueries(filters, types, (timestamp_gte - 60 * 60 * 24 * 1000), (timestamp_lte - 60 * 60 * 24 * 1000), userFilter, "*", domainFilter), supress);

            //timestamp_lte - 1 * 60 * 1000
            // CALLS ACTUAL (last 1 min)
            const callsActual = agg_query.getTemplate(
                "max", "countCall",
                getQueries(filters, types, lastTimebucket, timestamp_lte, userFilter, "*", domainFilter), supress);

            const regsActual = agg_query.getTemplate(
                "max", "countReg",
                getQueries(filters, types, lastTimebucket, timestamp_lte, userFilter, "*", domainFilter), supress);

            //get one minute ago time interval
            const callsActualMinuteAgo = agg_query.getTemplate(
                "max", "countCall",
                getQueries(filters, types, timestamp_lte - 1 * 120 * 1000, timestamp_lte - 1 * 60 * 1000, userFilter, "*", domainFilter), supress);

            const regsActualMinuteAgo = agg_query.getTemplate(
                "max", "countReg",
                getQueries(filters, types, timestamp_lte - 1 * 120 * 1000, timestamp_lte - 1 * 60 * 1000, userFilter, "*", domainFilter), supress);

            const incidentCount = datehistogram_query.getTemplate(
                timebucket,
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), timestamp_gte, timestamp_lte, supress);

            const incidentCountDayAgo = datehistogram_query.getTemplate(
                timebucket,
                getQueries(filters, types, (timestamp_gte - 60 * 60 * 24 * 1000), (timestamp_lte - 60 * 60 * 24 * 1000), userFilter, "*", domainFilter), timestamp_gte, timestamp_lte, supress);

            const incidentActual = timerange_query.getTemplate(
                getQueries(filters, types,lastTimebucket, timestamp_lte, userFilter, "*", domainFilter), supress);

            const incidentActualMinuteAgo = timerange_query.getTemplate(
                getQueries(filters, types, timestamp_lte - 1 * 120 * 1000, timestamp_lte - 1 * 60 * 1000, userFilter, "*", domainFilter), supress);



            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sumCallEnd,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sumCallAttempt,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    avgFailureRatio,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    durationSum,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    answerSeizureRatio,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    avgDuration,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    typeDateHeatmap,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    parallelCalls,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    parallelCallsDayAgo,
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
                    regsActual,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    callsActual,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    incidentCount,
                    {
                        index: 'exceeded*',
                        //index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    incidentCountDayAgo,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    incidentActual,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    callsActualMinuteAgo,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    regsActualMinuteAgo,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    incidentActualMinuteAgo,
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
}

module.exports = HomeController;
