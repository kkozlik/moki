// Micronalysis.js hold the Micronalysis endpoint

const {
    getFiltersConcat,
    getTypesConcat,
    getQueries
} = require('../utils/metrics');
const {
    connectToES
} = require('../modules/elastic');

let {
    getTimestampBucket,
    timestamp_gte,
    timestamp_lte
} = require('../utils/ts');
const { getJWTsipUserFilter } = require('../modules/jwt');


const agg_query = require('../../js/template_queries/agg_query.js');
var agg_cardinality = require('../../js/template_queries/agg_cardinality.js');
var agg_filter = require('../../js/template_queries/agg_filter.js');
var two_agg_query = require('../../js/template_queries/two_agg_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class MicronalysisController {

    /**
     * @swagger
     * /api/micronalysis/charts:
     *   post:
     *     description: Get Micronalysis charts
     *     tags: [Chart]
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
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);
            console.log(`SERVER search with filters: ${filters} types: ${types} ` +
                `timerange: ${timestamp_gte}-${timestamp_lte} ` +
                ` timebucket: ${timebucket} diff: ${(timestamp_lte - timestamp_gte)}`);

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            //TYPES
            const typesCount = agg_query.getTemplate("terms", 'attrs.type', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del OR attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt OR attrs.type:notice OR attrs.type:auth-failed OR attrs.type:log-reply OR attrs.type:action-log OR attrs.type:message-log OR attrs.type:error OR attrs.type:alert OR attrs.type:fbl-new OR attrs.type:fgl-new OR attrs.type:message-dropped OR attrs.type:recording OR attrs.type:limit OR attrs.type:prompt", domainFilter), supress);

            //FROM UA
            const fromUA = agg_query.getTemplate("terms", "attrs.from-ua", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SRC CA
            const srcCA = agg_query.getTemplate("terms", "attrs.src_ca_id", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //DST CA
            const dstCA = agg_query.getTemplate("terms", "attrs.dst_ca_id", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //ORIGINATOR
            const originator = agg_query.getTemplate("terms", "attrs.originator", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SIP METHOD
            const sipMethod = agg_query.getTemplate("terms", "attrs.method", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SIP CODE
            const sipCode = agg_query.getTemplate("terms", "attrs.sip-code", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOP SUBNETS
            const topSubnets = agg_query.getTemplate("terms", "attrs.sourceSubnets", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //r-URI PREFIX STRIPPED
            const prefixStripped = agg_query.getTemplate("terms", "attrs.r-uri-shorted", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SOURCE IP ADDRESS
            const sourceIP = agg_query.getTemplate("terms", "attrs.source", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOP 10 FROM
            const top10from = agg_query.getTemplate("terms", "attrs.from.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //CALLER DOMAIN
            const callerDomain = agg_query.getTemplate("terms", "attrs.from-domain", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOP 10 TO
            const top10to = agg_query.getTemplate("terms", "attrs.to.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //DOMAIN STATS
            const domainStats = agg_cardinality.getTemplate("attrs.from-domain", "attrs.from.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOP CALL ATTEMPTS
            const topCallAttempts = agg_filter.getTemplate('attrs.from.keyword', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-attempt", domainFilter), supress);

            //TOP CALL ENDS
            const topCallEnds = agg_filter.getTemplate('attrs.from.keyword', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);

            //DESTINATION BY R-URI
            const destination = agg_filter.getTemplate('attrs.r-uri.keyword', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end OR attrs.type:call-attempt", domainFilter), supress);

            //DURATION SUM
            const durationSum = two_agg_query.getTemplate("attrs.from.keyword", "sum", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);

            //MAX SUM
            const durationMax = two_agg_query.getTemplate("attrs.from.keyword", "max", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);

            //TOP DURATION <5
            const topDuration5 = agg_filter.getTemplate('attrs.from.keyword', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.duration: [0 TO 5]", domainFilter), supress);

            //TOP SBCs LIST
            const topSBC = agg_query.getTemplate("terms", "attrs.sbc", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const response = await client.msearch({
                body: [
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    typesCount,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    fromUA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sipMethod,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sipCode,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topSubnets,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    prefixStripped,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sourceIP,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    top10from,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    callerDomain,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    top10to,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    domainStats,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topCallAttempts,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topCallEnds,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    destination,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    durationSum,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    durationMax,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topDuration5,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topSBC,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    srcCA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    dstCA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    originator
                ]
            }).catch((err) => {
                /*res.render('error_view', {
                  title: 'Error',
                  error: err
                  });*/
                err.status = 400
                return next(err);
            });

            console.log(new Date + " got elastic data");
            client.close();
            return res.json(response);
        }

        return search().catch(e => {
            return next(e);
        });
    }

}

module.exports = MicronalysisController;
