const Controller = require('./controller');
const datehistogram_three_agg_query = require('../../js/template_queries/datehistogram_three_agg_query');
const datehistogram_three_agg_query_max = require('../../js/template_queries/datehistogram_three_agg_query_max');

class networkController extends Controller {

  /**
   * @swagger
   * /api/network/charts:
   *   post:
   *     description: Get network charts
   *     tags: [Network]
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
      //CALLS BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.calls', 'attrs.calls', "timebucket"], filter: "*" },
      //REGS BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.regs', 'attrs.regs', "timebucket"], filter: "*" },
      //CALL STARTS BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query_max, params: ['attrs.hostname', 'attrs.callstarts', 'attrs.callstarts', "timebucket"], filter: "*" },
      //RELAYED RTP BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'attrs.bits', 'attrs.bits', "timebucket"], filter: "*" },
      //RX BYTES BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'rx', 'rx', "timebucket"], filter: "tags:collectd AND attrs.type:if_octets" },
      //TX BYTES BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'tx', 'tx', "timebucket"], filter: "tags:collectd AND attrs.type:if_octets" },
      //RX BYTES BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'rx', 'rx', "timebucket"], filter: "tags:collectd AND attrs.type:if_packets" },
      //TX PACKET BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'tx', 'tx', "timebucket"], filter: "tags:collectd AND attrs.type:if_octets" },
      //RX BYTES BY INTERFACE
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['type_instance', 'rx', 'rx', "timebucket"], filter: "tags:collectd AND attrs.type:if_octets" },
      //TX BYTES BY INTERFACE
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['type_instance', 'tx', 'tx', "timebucket"], filter: "tags:collectd AND attrs.type:if_octets" },
      //RX PACKETS BY INTERFACE
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['type_instance', 'rx', 'rx', "timebucket"], filter: "tags:collectd AND attrs.type:if_packets" },
      //TX PACKETS BY INTERFACE
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['type_instance', 'tx', 'tx', "timebucket"], filter: "tags:collectd AND attrs.type:if_packets" },
      //IPS ON FW BLACKLIST BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostnames', 'value', 'value', "timebucket"], filter: "tags:collectd AND plugin_instance:blacklist" },
      //IPS ON FW GREYLIST BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd AND plugin_instance:greylist" },
      //IPS ON FW WHITELIST BY HOST
      { index: "collectd*", template: datehistogram_three_agg_query, params: ['attrs.hostname', 'value', 'value', "timebucket"], filter: "tags:collectd AND plugin_instance:whitelist" },
    ]);
  }

  /**
   * @swagger
   * /api/network/table:
   *   post:
   *     description: Get data for table
   *     tags: [Network]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: pretty
   *         description: Return a pretty json
   *         in: query
   *         required: false
   *         type: bool
   *       - name: form
   *         description: Network chart form
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
    super.requestTable(req, res, next, { index: "collectd*", filter: "tags:collectd NOT attrs.type:memory AND NOT attrs.type:percent AND  NOT attrs.type:realm_counters AND NOT attrs.type:global_counters" });
  }

}

module.exports = networkController;
