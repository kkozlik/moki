const Controller = require('./controller.js');
var datehistogram_two_agg_query = require('../../js/template_queries/datehistogram_two_agg_query.js');

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
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'attrs.calls', "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "*" },
            //REGS BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'attrs.regs', "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "*" },
            //CALL STARTS BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'attrs.callstarts',  "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "*" },
            //RELAYED RTP BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'attrs.bits',  "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "*" },
            //RX BYTES BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'rx', "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_octets" },
            //TX BYTES BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'tx', "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_octets" },
            //RX BYTES BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'rx',  "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_packets" },
            //TX PACKET BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'tx',  "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_octets" },
            //RX BYTES BY INTERFACE
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['type_instance', 'rx',  "timebucket",  "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_octets" },
            //TX BYTES BY INTERFACE
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['type_instance', 'tx', "timebucket",  "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_octets" },
            //RX PACKETS BY INTERFACE
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['type_instance', 'rx',  "timebucket",  "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_packets" },
            //TX PACKETS BY INTERFACE
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['type_instance', 'tx',  "timebucket",  "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND attrs.type:if_packets" },
            //IPS ON FW BLACKLIST BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['type_instance', 'value',  "timebucket",  "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND plugin_instance:blacklist" },
            //IPS ON FW GREYLIST BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ['attrs.hostname', 'value',  "timebucket",  "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND plugin_instance:greylist" },
            //IPS ON FW WHITELIST BY HOST
            { index: "collectd*", template: datehistogram_two_agg_query, params: ["'attrs.hostname'", "value", "timebucket", "timestamp_gte", "timestamp_lte", "max"], filter: "tags:collectd AND plugin_instance:whitelist" },
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
