const Controller = require('./controller.js');
var range_query = require('../../js/template_queries/range_query.js');
var range_query_animation = require('../../js/template_queries/range_query_animation.js');
var histogram_datehistogram_query = require('../../js/template_queries/histogram_datehistogram_query.js');

class qosController extends Controller {

    /**
     * @swagger
     * /api/qos/charts:
     *   post:
     *     description: Get qos charts
     *     tags: [QoS]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: QoS chart form
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
            //MOS HISTOGRAM
            { index: "logstash*", template: range_query, params: ["attrs.rtp-MOScqex-avg"], filter: "*" },
            //MoS STATS
            { index: "logstash*", template: histogram_datehistogram_query, params: ["attrs.rtp-MOScqex-avg", "timebucket"], filter: "*" }
        ]);
    }


    /**
     * @swagger
     * /api/qos/qos_histogram:
     *   post:
     *     description: Get QoS HISTOGRAM data for animation
     *     tags: [QoS]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: QoS chart form
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
    static getQoSHistogram(req, res, next) {
        super.request(req, res, next, [
            //MOS HISTOGRAM
            { index: "logstash*", template: range_query_animation, params: ["attrs.rtp-MOScqex-avg", "timebucketAnimation", "timestamp_gte", "timestamp_lte"], filter: "*" }
        ]);
    }

    /**
     * @swagger
     * /api/qos/table:
     *   post:
     *     description: Get data for table
     *     tags: [QoS]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: QoS chart form
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
        super.requestTable(req, res, next, { index: "logstash*", filter: "attrs.type:call-end AND (attrs.rtp-lossmax: [25 TO *]  OR attrs.rtp-lossavg: [15 TO *]  OR attrs.rtp-MOScqex-min : [* TO 2]  OR attrs.rtp-MOScqex-avg: [* TO 3] OR attrs.rtp-direction:'oneway'  )" });
    }

}

module.exports = qosController;
