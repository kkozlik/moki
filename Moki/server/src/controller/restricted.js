const Controller = require('./controller.js');

const datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
const query_string = require('../../js/template_queries/query_string.js');
const agg_sum_bucket_query = require('../../js/template_queries/agg_sum_bucket_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
const date_bar = require('../../js/template_queries/date_bar_query.js');

class restrictedController extends Controller {

    /**
     * @swagger
     * /api/restricted/charts:
     *   post:
     *     description: Get restricted charts, in AWS after no-admin user login
     *     tags: [Restricted]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Restricted chart form
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
            { index: "logstash*", template: query_string, filter: "attrs.type:call-end" },
            //SUM CALL-ATTEMPT
            { index: "logstash*", template: query_string, filter: "attrs.type:call-attempt" },
            //CALLING COUNTRIES
            { index: "logstash*", template: agg_query, params: ["terms", "geoip.country_code2"], filter: "*" },
            //DURATION SUM 
            { index: "logstash*", template: agg_query, params: ["sum", "attrs.duration"], filter: "*" },
            //ANSWER-SEIZURE RATIO 
            { index: "logstash*", template: agg_sum_bucket_query, params: ["CallEnd", "AnsweredCalls"], filter: "*" },
            //AVG DURATION
            { index: "logstash*", template: agg_query, params: ["avg", "attrs.duration"], filter: "*" },
            //SUM DURATION OVER TIME
            { index: "logstash*", template: date_bar, params: ["attrs.duration", "timebucket"], filter: "*" },
            //FROM UA
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.from-ua"], filter: "*" },
            //SOURCE IP ADDRESS
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.source"], filter: "*" },
            //EVENT CALLS TIMELINE
            { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" },
            //EVENT EXCEEDED TIMELINE
            { index: "exceeded*", template: datehistogram_agg_filter_query, params: ["exceeded", "timebucket"], filter: "*" },
            //TOP 10 TO 
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.to.keyword"], filter: "*" },
            //AVG MoS
            { index: "logstash*", template: agg_query, params: ["avg", "attrs.rtp-MOScqex-avg"], filter: "*" }
        ]);
    }

    /**
     * @swagger
     * /api/restricted/calls:
     *   post:
     *     description: Get data for calls, in AWS after no-admin user login
     *     tags: [Restricted]
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
    static getCalls(req, res, next) {
        super.requestTable(req, res, next, { index: "logstash*", filter: "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:limit OR attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del" });
    }

    /**
     * @swagger
     * /api/restricted/table:
     *   post:
     *     description: Get data for table, in AWS after no-admin user login
     *     tags: [Restricted]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Restricted chart form
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
        super.requestTable(req, res, next, { index: "excceded*", filter: "*" });
    }

}

module.exports = restrictedController;
