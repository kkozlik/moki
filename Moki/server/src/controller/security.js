const Controller = require('./controller');
const geoip = require('../../js/template_queries/geoip_agg_filter');
const datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query');
const agg_filter = require('../../js/template_queries/agg_filter');
const agg_filter_animation = require('../../js/template_queries/agg_filter_animation');
const geoipAnimation = require('../../js/template_queries/geoip_agg_filter_animation');
const agg_query = require('../../js/template_queries/agg_query');
const geoip_hash_query = require('../../js/template_queries/geoip_agg_hash_filter');
const fs = require('fs');

class securityController extends Controller {

  /**
   * @swagger
   * /api/security/charts:
   *   post:
   *     description: Get security charts
   *     tags: [Security]
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


/*
    let rawdata = fs.readFileSync('/usr/share/Moki/server/src/geonames-all-cities-with-a-population-500_fin.json');
    let json = JSON.parse(rawdata);

    var data = [];
*/
  /*
    for (var i = 0; i < json.length; i++) {
      data.push({
        geoname_id: json[i].fields.geoname_id,
        name: json[i].fields.name,
        longitude: json[i].fields.longitude,
        latitude: json[i].fields.latitude,
      })
    }
    */
   /*
    json.sort(function(a,b){
      return a["geoname_id"] - b["geoname_id"];
  });

    let dataout = JSON.stringify(json);
    fs.writeFileSync('/usr/share/Moki/server/src/geonames-all-cities-with-a-population-500_fin2.json', dataout);
*/


    super.request(req, res, next, [
      //SECURITY DISTRIBUTION MAP
      { index: "logstash*", template: geoip, filter: '*' },
      //EVENT SECURITY  TIMELINE
      { index: "logstash*", template: datehistogram_agg_filter_query, params: ["attrs.type", "timebucket"], filter: "*" },
      //EVENTS BY IP ADDR
      { index: "logstash*", template: agg_filter, params: ['attrs.source', 10], filter: "*" },
      //TOP SUBNETS /24
      { index: "logstash*", template: agg_filter, params: ["attrs.sourceSubnets", 10], filter: "*" },
      //EVENTS BY COUNTRY
      { index: "logstash*", template: agg_filter, params: ['geoip.country_code2', 10], filter: "*" },
      //TYPES
      { index: "logstash*", template: agg_query, params: ["terms", 'attrs.type'], filter: "*" },
      //MAP FOR GEOHASH
      { index: "logstash*", template: geoip_hash_query, params: [3], filter: "*" }
    ], "security");
  }


  /**
   * @swagger
   * /api/security/events_by_ip_addr:
   *   post:
   *     description: Get events by IP addr for animation
   *     tags: [Security]
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
  static getEventsByIP(req, res, next) {
    super.request(req, res, next, [
      //EVENTS BY IP ADDR
      { index: "logstash*", template: agg_filter_animation, params: ['attrs.source', "timebucketAnimation", "timestamp_gte", "timestamp_lte", 10], filter: "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new" }
    ]);
  }


  /**
   * @swagger
   * /api/security/top_subnets:
   *   post:
   *     description: Get top subnets events for animation
   *     tags: [Security]
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
  static getTopSubnets(req, res, next) {
    super.request(req, res, next, [
      //TOP SUBNETS /24
      { index: "logstash*", template: agg_filter_animation, params: ['attrs.sourceSubnets', "timebucketAnimation", "timestamp_gte", "timestamp_lte", 10], filter: "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new" }
    ]);
  }


  /**
   * @swagger
   * /api/security/events_by_country:
   *   post:
   *     description: Get events by country for animation
   *     tags: [Security]
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
  static getEventsByCountry(req, res, next) {
    super.request(req, res, next, [
      //EVENTS BY COUNTRY
      { index: "logstash*", template: agg_filter_animation, params: ['attrs.country_code2', "timebucketAnimation", "timestamp_gte", "timestamp_lte", 10], filter: "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new" }
    ]);
  }

  static getEventsByCountryLimit(req, res, next) {
    super.request(req, res, next, [
      //EVENTS BY COUNTRY
      { index: "logstash*", template: agg_filter_animation, params: ['attrs.country_code2', "timebucketAnimation", "timestamp_gte", "timestamp_lte", 3], filter: "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new" }
    ]);
  }

  static getGeoData(req, res, next) {
    super.request(req, res, next, [
      //EVENTS BY COUNTRY
      { index: "logstash*", template: agg_query, params: ["terms", 'geoip.dst.city_id'], filter: "*" },
    ]);
  }


  /**
   * @swagger
   * /api/security/events_by_ip_addr:
   *   post:
   *     description: Get events by IP addr for animation
   *     tags: [Security]
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
  static getEventsByIPWeb(req, res, next) {
    super.request(req, res, next, [
      //EVENTS BY IP ADDR
      { index: "logstash*", template: agg_filter_animation, params: ['attrs.source', "timebucketAnimation", "timestamp_gte", "timestamp_lte", 3], filter: "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new" }
    ]);
  }


  /**
   * @swagger
   * /api/security/security_geo_events:
   *   post:
   *     description: Get geoip chart
   *     tags: [Security]
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
      //GEOIP MAP
      { index: "logstash*", template: geoipAnimation, params: ["timebucketAnimation", "timestamp_gte", "timestamp_lte"], filter: "attrs.type:limit OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:fbl-new OR attrs.type:fgl-new" }
    ]);
  }

  /**
* @swagger
* /api/security/table:
*   post:
*     description: Get data for table
*     tags: [Security]
*     produces:
*       - application/json
*     parameters:
*       - name: pretty
*         description: Return a pretty json
*         in: query
*         required: false
*         type: bool
*       - name: form
*         description: Security chart form
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
    super.requestTable(req, res, next, { index: "logstash*", filter: "*" }, "security");
  }

}

module.exports = securityController;
