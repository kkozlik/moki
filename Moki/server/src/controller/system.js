const Controller = require('./controller');
const datehistogram_three_agg_query = require('../../js/template_queries/datehistogram_three_agg_query');

class systemController extends Controller {
  /**
   * @swagger
   * /api/system/charts:
   *   post:
   *     description: Get system charts
   *     tags: [System]
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
      //LOAD-SHORTTERM
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'shortterm', 'shortterm', "timebucket"], filter: "tags:collectd AND attrs.type:load" },
      //LOAD-midTERM
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'midterm', 'midterm', "timebucket"], filter: "tags:collectd AND attrs.type:load" },
      //LOAD-LONGTERM
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'longterm', 'longterm', "timebucket"], filter: "tags:collectd AND attrs.type:load" },
      //MEMORY FREE
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd  AND plugin:memory AND type_instance:free" },
      //MEMORY USED
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd  AND plugin:memory AND  type_instance:used" },
      //MEMORY CACHED
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd  AND plugin:memory AND type_instance:cached" },
      //MEMORY BUFFERED
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd  AND plugin:memory AND type_instance:buffered" },
      //UAS
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'attrs.uas_trans', 'attrs.uas_trans', "timebucket"], filter: "*" },
      //UAC
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'attrs.uac_trans', 'attrs.uac_trans', "timebucket"], filter: "*" },
      //CPU-USER
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd  AND plugin:cpu AND  type_instance:user" },
      //UAC
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd  AND plugin:cpu AND type_instance:system" },
      //CPU-IDLE
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd  AND plugin:cpu AND type_instance:idle" },
    ]);
  }

  /**
   * @swagger
   * /api/system/table:
   *   post:
   *     description: Get data for table
   *     tags: [System]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: pretty
   *         description: Return a pretty json
   *         in: query
   *         required: false
   *         type: bool
   *       - name: form
   *         description: System chart form
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
    super.requestTable(req, res, next, { index: "collectd*", filter: "tags:collectd AND NOT type_instance:fSBCCallsTimeout AND NOT type_instance:fSBCRegsTimeout AND NOT attrs.type:realm_counters AND NOT attrs.type:global_counters" });
  }

}

module.exports = systemController;
