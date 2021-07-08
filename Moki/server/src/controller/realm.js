const Controller = require('./controller');
const datehistogram_three_agg_query_max = require('../../js/template_queries/datehistogram_three_agg_query_max');

class realmController extends Controller {

  /**
   * @swagger
   * /api/realm/charts:
   *   post:
   *     description: Get realm charts
   *     tags: [Realm]
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
      //MAX CALLS FROM BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.callfrom', 'attrs.callfrom', "timebucket"], filter: "*" },
      //MAX CALLS To BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.callsto', 'attrs.callsto', "timebucket"], filter: "*" },
      //MAX CALLS FROM BY REALM
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.realm', 'attrs.callfrom', 'attrs.callfrom', "timebucket"], filter: "*" },
      //MAX CALLS TO BY REALM
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.realm', 'attrs.callsto', 'attrs.callsto', "timebucket"], filter: "*", types: "*" },
      //MAX START CALLS FROM BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.callstartfrom', 'attrs.callstartfrom', "timebucket"], filter: "*" },
      //MAX START CALLS To BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.callstartto', 'attrs.callstartto', "timebucket"], filter: "*" },
      //MAX START CALLS FROM BY REALM
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.realm', 'attrs.callstartfrom', 'attrs.callstartfrom', "timebucket"], filter: "*" },
      //MAX START CALLS TO BY REALM
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.realm', 'attrs.callstartto', 'attrs.callstartto', "timebucket"], filter: "*" },
      //RTP RELAYED TO BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.bitsto', 'attrs.bitsto', "timebucket"], filter: "*" },
      //RTP RELAYED FROM BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.bitsfrom', 'attrs.bitsfrom', "timebucket"], filter: "*" },
      //RTP RELAYED TO BY REALM
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.realm', 'attrs.bitsto', 'attrs.bitsto', "timebucket"], filter: "*" },
      //RTP RELAYED FROM BY REALM
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.realm', 'attrs.bitsfrom', 'attrs.bitsfrom', "timebucket"], filter: "*" },

    ]);
  }

  /**
* @swagger
* /api/realm/table:
*   post:
*     description: Get data for table
*     tags: [Realm]
*     produces:
*       - application/json
*     parameters:
*       - name: pretty
*         description: Return a pretty json
*         in: query
*         required: false
*         type: bool
*       - name: form
*         description: Realm chart form
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
    super.requestTable(req, res, next, { index: "collectd*", filter: "attrs.type:realm_counters OR attrs.type:global_counters" });
  }

}

module.exports = realmController;
