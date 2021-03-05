const Controller = require('./controller.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var agg_query = require('../../js/template_queries/agg_query.js');
var datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query.js');
var two_agg_query_limit = require('../../js/template_queries/two_agg_query_limit.js');

class overviewController extends Controller {

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
        super.request(req, res, next, [
            //EVENT OVERVIEW TIMELINE
            { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" },
            //TOTAL EVENTS IN INTERVAL
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.type"], filter: "*" },
            //ACTIVITY OF SBCS
            { index: "logstash*", template: datehistogram_agg_query, params: ["attrs.hostname", "terms", "timebucket"], filter: "*" },
            //SBC KEEP ALIVE, types: none - no type fiilter - special case different index 
            { index: "collectd*", template: datehistogram_agg_query, params: ["attrs.hostname", "terms", "timebucket"], filter: "*", types: "*" },
            //SBC ACTIVITY TYPES
            { index: "logstash*", template: two_agg_query_limit, params: ["attrs.sbc", "terms", "attrs.type"], filter: "*" },
            //list of tags
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.tags"], filter: "*" }
        ]);
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
        super.requestTable(req, res, next, { index: "logstash*", filter: "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del OR attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt OR attrs.type:notice OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:action-log OR attrs.type:message-log OR attrs.type:error OR attrs.type:alert OR attrs.type:fbl-new OR attrs.type:fgl-new OR attrs.type:message-dropped OR attrs.type:recording OR attrs.type:limit OR attrs.type:prompt OR attrs.type:conf-join OR attrs.type:conf-leave" });
    }

}

module.exports = overviewController;
