// Conference.js hold the conference endpoint
const Controller = require('./controller.js');
const query_string = require('../../js/template_queries/query_string.js');
const agg_query = require('../../js/template_queries/agg_query.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var agg_sum_bucket_query_term = require('../../js/template_queries/agg_sum_bucket_term_query.js');
var sort_query = require('../../js/template_queries/sort_query.js');
const checkSelectedTypes = require('../utils/metrics');

class ConferenceController extends Controller {

    /**
     * @swagger
     * /api/conference/charts:
     *   post:
     *     description: Get Conference charts
     *     tags: [Conference]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: conference chart form
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
            //SUM CALL-END
            { index: "logstash*", template: query_string, filter: "attrs.type:conf-leave" },
            //SUM CALL-START
            { index: "logstash*", template: query_string, filter: "attrs.type:conf-join" },
            //DURATION SUM
            { index: "logstash*", template: agg_query, params: ["max", "attrs.duration"], filter: "attrs.type:conf-leave" },
            //AVERAGE DURATION
            { index: "logstash*", template: agg_query, params: ["avg", "attrs.duration"], filter: "attrs.type:conf-leave" },
            //AVG PARTICIPANTS
            { index: "logstash*", template: agg_sum_bucket_query_term, params: ["attrs.from.keyword"], filter: "attrs.type:conf-join" },
            //TOP CONFERENCES 
            { index: "collectd*", template: agg_query, params: ["terms", "attrs.conf_id"], filter: "attrs.type:conf-join" },
            //EVENT CONFERENCE TIMELINE
            { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" },
            //ACTIVE CONFERENCES  
            { index: "logstash*", template: agg_query, params: ["max", "attrs.count"], filter: "attrs.type:conference_room", timestamp_gte: " - 1 * 60 * 1000" },
            //TOP PARTICIPANTS 
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.from-keyword"], filter: "attrs.type:conf-join" },
            //TOP ACTIVE CONFERENCES  
            { index: "logstash*", template: sort_query, params: ["attrs.count", 1], filter: "attrs.type:conference_room", timestamp_gte: " - 1 * 60 * 1000" }
        ], "conference");
    }

    /**
    * @swagger
    * /api/conference/table:
     *   post:
     *     description: Get data for table
     *     tags: [Conference]
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
     *               $ref: '#/definitions/TableResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static async getTable(req, res, next) {
        var types = await checkSelectedTypes.checkSelectedTypes([], "calls");
        super.requestTable(req, res, next, { index: "logstash*", filter: types });
    }
}

module.exports = ConferenceController;
