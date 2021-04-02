const Controller = require('./controller.js');

const agg_query = require('../../js/template_queries/agg_query.js');
var agg_cardinality = require('../../js/template_queries/agg_cardinality.js');
var agg_filter = require('../../js/template_queries/agg_filter.js');
var two_agg_query = require('../../js/template_queries/two_agg_query.js');

class MicronalysisController extends Controller {

    /**
     * @swagger
     * /api/micronalysis/charts:
     *   post:
     *     description: Get Micronalysis charts
     *     tags: [Micronalysis]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Micronalysis chart form
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
            //TYPES
            { index: "logstash*", template: agg_query, params: ["terms", 'attrs.type'], filter: "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del OR attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt OR attrs.type:notice OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:action-log OR attrs.type:message-log OR attrs.type:error OR attrs.type:alert OR attrs.type:fbl-new OR attrs.type:fgl-new OR attrs.type:message-dropped OR attrs.type:recording OR attrs.type:limit OR attrs.type:prompt" },
            //FROM UA
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.from-ua"], filter: "*" },
            //SIP METHOD
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.method"], filter: "*" },
            //SIP CODE
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.sip-code"], filter: "*" },
            //TOP SUBNETS
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.sourceSubnets"], filter: "*" },
            //r-URI PREFIX STRIPPED
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.r-uri-shorted"], filter: "*" },
            //SOURCE IP ADDRESS
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.source"], filter: "*" },
            //TOP 10 FROM
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.from.keyword"], filter: "*" },
            //CALLER DOMAIN
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.from-domain"], filter: "*" },
            //TOP 10 TO
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.to.keyword"], filter: "*" },
            //DOMAIN STATS
            { index: "logstash*", template: agg_cardinality, params: ["attrs.from-domain", "attrs.from.keyword"], filter: "*" },
            //TOP CALL ATTEMPTS
            { index: "logstash*", template: agg_filter, params: ['attrs.from.keyword', 10], filter: "attrs.type:call-attempt" },
            //TOP CALL ENDS
            { index: "logstash*", template: agg_filter, params: ['attrs.from.keyword', 10], filter: "attrs.type:call-end" },
            //DESTINATION BY R-URI
            { index: "logstash*", template: agg_filter, params: ['attrs.r-uri.keyword', 10], filter: "attrs.type:call-end OR attrs.type:call-attempt" },
            //DURATION SUM
            { index: "logstash*", template: two_agg_query, params: ["attrs.from.keyword", "sum", "attrs.duration"], filter: "attrs.type:call-end" },
            //MAX SUM
            { index: "logstash*", template: two_agg_query, params: ["attrs.from.keyword", "max", "attrs.duration"], filter: "attrs.type:call-end" },
            //TOP DURATION <5
            { index: "logstash*", template: agg_filter, params: ["attrs.from.keyword", 10], filter: "attrs.duration: [0 TO 5]" },
            //TOP SBCs LIST
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.sbc"], filter: "attrs.type:call-end" },
            //SRC CA
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.src_ca_id"], filter: "*" },
            //DST CA
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.dst_ca_id"], filter: "*" },
            //ORIGINATOR
            { index: "logstash*", template: agg_query, params: ["terms", "attrs.originator"], filter: "*" }
        ], "microanalysis");
    }

}

module.exports = MicronalysisController;
