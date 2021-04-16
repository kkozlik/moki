const Controller = require('./controller.js');
const geoip = require('../../js/template_queries/geoip_agg_filter.js');
const datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
const agg_filter = require('../../js/template_queries/agg_filter.js');
const datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
var geoipAnimation = require('../../js/template_queries/geoip_agg_filter_animation.js');
const geoip_hash_query = require('../../js/template_queries/geoip_agg_hash_filter.js');

class registrationController extends Controller {

    /**
     * @swagger
     * /api/registration/charts:
     *   post:
     *     description: Get registration charts
     *     tags: [Registration]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Registration chart form
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
            //REGISTRATION DISTRIBUTION MAP
            { index: "logstash*", template: geoip, filter: "*" },
            //EVENT REGISTRATIONS  TIMELINE
            { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" },
            //USER-AGENTS IN REG. NEW
            { index: "logstash*", template: agg_filter, params: ['attrs.from-ua', 10], filter: 'attrs.type:reg-new' },
            //TOP REG. EXPIRED
            { index: "logstash*", template: agg_filter, params: ["attrs.from.keyword", 10], filter: "attrs.type:reg-expired" },
            //TRANSPORT PROTOCOL
            { index: "logstash*", template: agg_filter, params: ['attrs.transport', 10], filter: "*" },
            //PARALLEL REGS
            { index: "collectd*", template: datehistogram_agg_query, params: ["countReg", "max", "timebucket"], filter: "*" },
            //PARALLEL REGS 1 DAY AGO   
            { index: "collectd*", template: datehistogram_agg_query, params: ["countReg", "max", "timebucket"], filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000" },
            //ACTUAL REGS  
            { index: "collectd*", template: agg_query, params: ["max", "countReg"], filter: "*", timestamp_gte: "lastTimebucket" },
            //MAP FOR GEOHASH
            { index: "logstash*", template: geoip_hash_query, params: [3], filter: "*" }
        ], "registration");
    }


    /**
     * @swagger
     * /api/registration/registrations_map:
     *   post:
     *     description: Get geoip chart
     *     tags: [Registration]
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
    static getGeoip(req, res, next) {
        super.request(req, res, next, [
            //GEOIP ANIMATION
            { index: "logstash*", template: geoipAnimation, params: ["timebucket", "timestamp_gte", "timestamp_lte"], filter: "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del" }
        ])
    }

    /**
     * @swagger
     * /api/registration/table:
     *   post:
     *     description: Get data for table
     *     tags: [Registration]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Registration chart form
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
        super.requestTable(req, res, next, { index: "logstash*", filter: "*" }, "registration");
    }
}

module.exports = registrationController;
