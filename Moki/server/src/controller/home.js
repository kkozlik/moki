const Controller = require('./controller.js');
const query_string = require('../../js/template_queries/query_string.js');
const agg_sum_bucket_query = require('../../js/template_queries/agg_sum_bucket_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
const datehistogram_query = require('../../js/template_queries/datehistogram_query.js');
const datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query.js');
const timerange_query = require('../../js/template_queries/timerange_query.js');
const two_agg_query = require('../../js/template_queries/two_agg_query.js');
const distinct_timerange_query_string = require('../../js/template_queries/distinct_timerange_query_string.js');

/**
 * @swagger
 * definitions:
 *   ChartForm:
 *     type: "object"
 *     properties:
 *        filters:
 *          description: filters to apply, if not filled, query will return everything.
 *          type: array
 *          items:
 *            $ref: "#/definitions/Filter"
 *        types:
 *          description: types to filter for different dashboards. No need to use this field to filter.
 *          type: array
 *          items:
 *            $ref: "#/definitions/Type"
 *        timerange_gte:
 *          description: gte time in UNIX timestamp in ms! If not filled the time range between gte and lte will be set to last 6 hours.
 *          type: timestamp
 *          example:
 *            1592458026000
 *        timerange_lte:
 *          description: lte time in UNIX timestamp  in ms! If not filled the time range between gte and lte will be set to last 6 hours.
 *          type: timestamp
 *          example:
 *            1592479626000
 *   Type:
 *     type: "object"
 *     required:
 *         - id
 *     properties:
 *        id:
 *          description: event type in attrs.type
 *          type: string
 *          example:
 *            "call-end"
 *        name:
 *          description: User friendly name, used only on client side
 *          type: string
 *          example:
 *            "Call end"
 *        state:
 *          description: state of type filter, used only on client side
 *          type: string
 *          enum:
 *          - "enable"
 *          - "disable"
 *          example:
 *            "enable"
 *   Filter:
 *     type: "object"
 *     required:
 *         - title
 *     properties:
 *        title:
 *          description: value of filter
 *          type: string
 *          example:
 *            "attrs.sip-code: 408"
 *        id:
 *          description: GUI id, used only on client side
 *          type: string
 *          example:
 *            1
 *        pinned:
 *          description: if filter should be in every dashboard, used only on client side
 *          type: string
 *          example:
 *            "true"
 *        state:
 *          description: state of type filter, used only on client side
 *          type: string
 *          enum:
 *          - "enable"
 *          - "disable"
 *          example:
 *            "enable"
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

class HomeController extends Controller {

    /**
     * @swagger
     * /api/home/charts:
     *   post:
     *     description: Get home charts
     *     tags: [Home]
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
        super.request(req, res, next, [
            //SUM CALL END
            { index: "logstash*", template: query_string, filter: "attrs.type:call-end" },
            //SUM CALL ATTEMPT
            { index: "logstash*", template: query_string, filter: "attrs.type:call-attempt" },
            //AVG FAILURE RATIO
            { index: "logstash*", template: agg_sum_bucket_query, params: ["SumFailureSuccess", "failure"], filter: "*" },
            //DURATION SUM
            { index: "logstash*", template: agg_query, params: ["sum", "attrs.duration"], filter: "*" },
            //ASR
            { index: "logstash*", template: agg_sum_bucket_query, params: ["CallEnd", "AnsweredCalls"], filter: "*" },
            //AVG DURATION
            { index: "logstash*", template: agg_query, params: ["avg", "attrs.duration"], filter: "*" },
            //TYPE HEATMAP
            { index: "logstash*", template: datehistogram_agg_query, params: ["attrs.type", "terms", "timebucket"], filter: "*" },
            //7 PARALLEL CALLS
            { index: "collectd*", template: datehistogram_agg_query, distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.calls", "timebucket"], filter: "*", exists: "attrs.calls" },
            //PARALLEL CALLS day ago
            { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.calls", "timebucket"], filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000", exists: "attrs.calls"},
            //9 PARALLEL REGS
            { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.regs", "timebucket"], filter: "*", exists: "attrs.regs"},
            //PARALLEL REGS day ago
            { index: "collectd*", template:  distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.regs", "timebucket"], filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000", exists: "attrs.regs" },
            //REGS ACTUAL (last time bucket)
            { index: "collectd*", template: two_agg_query, params: ["attrs.hostname", "max", "attrs.regs"], filter: "*", timestamp_gte: "lastTimebucket", exists: "attrs.regs" },
            //CALL ACTUAL (last time bucket)
            { index: "collectd*", template: two_agg_query, params: ["attrs.hostname", "max", "attrs.calls"],  filter: "*", timestamp_gte: "lastTimebucket",  exists: "attrs.calls" },
            //INCIDENT COUNT
            { index: "exceeded*", template: datehistogram_query, params: ["timebucket"], filter: "*" },
            //INCIDENT COUNT DAY AGO
            { index: "exceeded*", template: datehistogram_query, params: ["timebucket"], filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000" },
            //INCIDENT ACTUAL
            { index: "exceeded*", template: timerange_query, filter: "*", timestamp_gte: "lastTimebucket" },
            //CALLS MINUTE AGO
            { index: "collectd*", template: two_agg_query, params: ["attrs.hostname", "max", "attrs.calls"], filter: "*", timestamp_gte: "+ 1 * 120 * 1000", timestamp_lte: "- 1 * 60 * 1000", exists: "attrs.calls"  },
            //REGS MINUTE AGO
            { index: "collectd*", template: two_agg_query, params: ["attrs.hostname", "max", "attrs.regs"], filter: "*", timestamp_gte: "+ 1 * 120 * 1000", timestamp_lte: "- 1 * 60 * 1000", exists: "attrs.regs" },
             //INCIDENT ACTUAL MINUTE AGO
            { index: "exceeded*", template: timerange_query, filter: "*", timestamp_gte: "+ 1 * 120 * 1000", timestamp_lte: "- 1 * 60 * 1000" }
        ])
    }
}

module.exports = HomeController;
