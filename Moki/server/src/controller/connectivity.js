const Controller = require('./controller');
const two_agg_filter_query = require('../../js/template_queries/two_agg_filter_query');
const heatmap_query = require('../../js/template_queries/four_agg_heatmap_query');

class ConnectivityController extends Controller {

  /**
   * @swagger
   * /api/connectivity/charts:
   *   post:
   *     description: Get Connectivity charts
   *     tags: [Connectivity]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: pretty
   *         description: Return a pretty json
   *         in: query
   *         required: false
   *         type: bool
   *       - name: form
   *         description: connectivity chart form
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
      //topology chart
      { index: "logstash*", template: two_agg_filter_query, params: ["attrs.from.keyword", "attrs.to.keyword"], filter: "attrs.type:call-end" },
      //CONNECTION FAILURE RATIO 
      { index: "logstash*", template: heatmap_query, params: ["attrs.to.keyword", "failure", "attrs.from.keyword", "failure"], filter: "*" },
      //NUMBER OF CALL-ATTEMPS 
      { index: "logstash*", template: two_agg_filter_query, params: ["attrs.to.keyword", "attrs.from.keyword"], filter: "attrs.type:call-attempt" },
      //DURATION OF CALLS 
      { index: "logstash*", template: heatmap_query, params: ["attrs.to.keyword", "attrs.duration", "attrs.from.keyword", "attrs.duration"], filter: "*" },
      //NUMBER OF CALL-ENDS 
      { index: "logstash*", template: two_agg_filter_query, params: ["attrs.to.keyword", "attrs.from.keyword"], filter: "attrs.type:call-end" }
    ]);
  }

}

module.exports = ConnectivityController;
