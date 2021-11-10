const Controller = require('./controller');
const geoip = require('../../js/template_queries/geoip_agg_filter');
const datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query');
const agg_filter = require('../../js/template_queries/agg_filter');
const geoipAnimation = require('../../js/template_queries/geoip_agg_filter_animation');
const geoip_hash_query = require('../../js/template_queries/geoip_agg_hash_filter');
const distinct_timerange_query_string = require('../../js/template_queries/distinct_timerange_query_string');
const two_agg_query = require('../../js/template_queries/two_agg_query');
const two_agg_query_nolimit = require('../../js/template_queries/two_agg_query_nolimit');

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
      { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.regs", "timebucket"], filter: "*", exists: "attrs.regs", types: "*" },
      //PARALLEL REGS 1 DAY AGO   
      { index: "collectd*", template: distinct_timerange_query_string, params: ["attrs.hostname", "max", "attrs.regs", "timebucket"], filter: "*", timestamp_gte: "- 60 * 60 * 24 * 1000", timestamp_lte: "- 60 * 60 * 24 * 1000", exists: "attrs.regs", types: "*" },
      //ACTUAL REGS  
      { index: "collectd*", template: two_agg_query, params: ["attrs.hostname", "max", "attrs.regs"], filter: "*", timestamp_gte: "lastTimebucket", exists: "attrs.regs", types: "*" },
      //MAP FOR GEOHASH
      { index: "logstash*", template: geoip_hash_query, params: [3], filter: "*" },
      //TYPES DISTRIBUTIONS
      { index: "logstash*", template: agg_filter, params: ['attrs.type', 10], filter: "*" }
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
    ]);
  }

  static getGeoData(req, res, next) {
    super.request(req, res, next, [
      //EVENTS BY COUNTRY
      { index: "logstash*", template: two_agg_query_nolimit, params: ["geoip.src.iso_code", "terms", 'geoip.src.city_id'], filter: "*" },
    ]);
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
