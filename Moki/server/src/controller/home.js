const Controller = require('./controller');
const query_string = require('../../js/template_queries/query_string');
const agg_sum_bucket_query = require('../../js/template_queries/agg_sum_bucket_query');
const ratio = require('../../js/template_queries/ratio');
const agg_query = require('../../js/template_queries/agg_query');
const datehistogram_query = require('../../js/template_queries/datehistogram_query');
const datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query');
const distinct_timerange_query_string = require('../../js/template_queries/distinct_timerange_query_string');
const distinct_query_string = require('../../js/template_queries/distinct_query_string');
const multiple_query_home = require('../../js/template_queries/multiple_query_home');
const agg = require('../../js/template_queries/agg');

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
      //1 SUM CALL END
      { index: "logstash*", template: query_string, filter: "attrs.type:call-end" },
      //2 SUM CALL ATTEMPT
      { index: "logstash*", template: query_string, filter: "attrs.type:call-attempt" },
      //3 AVG FAILURE RATIO
      { index: "logstash*", template: agg_sum_bucket_query, params: ["SumFailureSuccess", "failure"], filter: "*" },
      //4 DURATION SUM
      { index: "logstash*", template: agg_query, params: ["sum", "attrs.duration"], filter: "*" },
      //5 ASR
      { index: "logstash*", template: agg_sum_bucket_query, params: ["CallEnd", "AnsweredCalls"], filter: "*" },
      //6 AVG DURATION
      { index: "logstash*", template: agg_query, params: ["avg", "attrs.duration"], filter: "*" },
      //7 TYPE HEATMAP
      { index: "logstash*", template: datehistogram_agg_query, params: ["attrs.type", "terms", "timebucket"], filter: "*" },
      //7 PARALLEL CALLS
      { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.calls", "timebucket", "timestamp_gte", "timestamp_lte"], types: "*", filter: "*", exists: "attrs.calls" },
      //8 PARALLEL CALLS day ago
      { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.calls", "timebucket", "timestamp_gte", "timestamp_lte"], types: "*", filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000", exists: "attrs.calls" },
      //9 PARALLEL REGS
      { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.regs", "timebucket", "timestamp_gte", "timestamp_lte"], types: "*", filter: "*", exists: "attrs.regs" },
      //10 PARALLEL REGS day ago
      { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.regs", "timebucket", "timestamp_gte", "timestamp_lte"], types: "*", filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000", exists: "attrs.regs" },
      //11 INCIDENT COUNT
      { index: "exceeded*", template: datehistogram_query, params: ["timebucket", "timestamp_gte", "timestamp_lte"], types: "*", filter: "*" },
      //12 INCIDENT COUNT DAY AGO
      { index: "exceeded*", template: datehistogram_query, params: ["timebucket", "timestamp_gte", "timestamp_lte"], types: "*", filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000" },
      //DISTINCT IP
      { index: "logstash*", template: distinct_query_string, params: ["attrs.source"], filter: "*" },
      //DISTINCT URI
      { index: "logstash*", template: distinct_query_string, params: ["attrs.from.keyword"], filter: "*" },
      //DOMAINS STATISTICS
      { index: "polda*", template: multiple_query_home, params: ["attrs.hostname", "blacklisted"], filter: "*", types: "*" },
      //filtered packets
      { index: "polda*", template: agg_query, params: ["sum", "pkt_accept"], filter: "*", types: "*" },
      //ratio blacklisted:processed
      { index: "polda*", template: ratio, params: ["blacklisted", "hits"], filter: "*", types: "*" },
      //ratio  whitelisted:processed
      { index: "polda*", template: ratio, params: ["whitelisted", "hits"], filter: "*", types: "*" },
      //SEVERITY
      { index: "exceeded*", template: agg, params: ["severity", "10"], filter: "*" , types: "*"}
    ]);
  }
}

module.exports = HomeController;
