const Controller = require('./controller.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');

class diagnosticsController extends Controller {

    /**
     * @swagger
     * /api/diagnostics/charts:
     *   post:
     *     description: Get diagnostics charts
     *     tags: [Diagnostics]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Diagnostics chart form
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
            { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" }], "diagnostics");
    }


    /**
     * @swagger
     * /api/diagnostics/table:
     *   post:
     *     description: Get data for table
     *     tags: [Diagnostics]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Diagnostics chart form
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
        super.requestTable(req, res, next, { index: "logstash*", filter: "*" }, "diagnostics");
    }

}

module.exports = diagnosticsController;
