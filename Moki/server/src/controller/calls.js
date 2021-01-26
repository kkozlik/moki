// calls.js hold the calls endpoint

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


const query_string = require('../../js/template_queries/query_string.js');
const agg_sum_bucket_query = require('../../js/template_queries/agg_sum_bucket_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
var agg_filter = require('../../js/template_queries/agg_filter.js');
var two_agg_no_order_query = require('../../js/template_queries/two_agg_no_order_query.js');
var date_bar = require('../../js/template_queries/date_bar_query.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var datehistogram_agg_sum_bucket_query = require('../../js/template_queries/datehistogram_agg_sum_bucket_query.js');
var timerange_query = require('../../js/template_queries/timerange_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class CallsController {

    /**
     * @swagger
     * /api/calls/charts:
     *   post:
     *     description: Get all calls charts
     *     tags: [Calls]
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
            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: " + domainFilter);


            //CALL TERMINATED
            const callTerminated = agg_filter.getTemplate('attrs.originator', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, 'attrs.type:call-end', domainFilter), supress);

            //CALL SUCCESS RATIO
            const callSuccessRatio = two_agg_no_order_query.getTemplate("termination", "terms", "attrs.sip-code", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SUM CALL-ATTEMPT
            const queryStringTemplate = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-attempt", domainFilter), supress);

            //SUM CALL-END
            const sumCallEnd = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);

            //SUM CALL-START
            const sumCallStart = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-start", domainFilter), supress);

            //DURATION SUM
            const durationSum = agg_query.getTemplate("sum", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //AVERAGE FAILURE RATIO
            const avgFailureRatio = agg_sum_bucket_query.getTemplate("SumFailureSuccess", "failure", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //AVG MoS
            const avgMoS = agg_query.getTemplate("avg", "attrs.rtp-MOScqex-avg", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //ANSWER-SEIZURE RATIO
            const answerSeizureRatio = agg_sum_bucket_query.getTemplate("CallEnd", "AnsweredCalls", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            //CALLING COUNTRIES
            const callingCountries = agg_query.getTemplate("terms", "geoip.country_code2", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SUM DURATION OVER TIME
            const sumDurationOverTime = date_bar.getTemplate("attrs.duration", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX DURATION
            const maxDuration = agg_query.getTemplate("max", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MIN DURATION
            const minDuration = agg_query.getTemplate("min", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //AVG DURATION
            const avgDuration = agg_query.getTemplate("avg", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            //DURATION GROUP
            const durationGroup = agg_query.getTemplate("terms", "attrs.durationGroup", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SIP-CODE COUNT
            const sipCodeCount = agg_query.getTemplate("terms", "attrs.sip-code", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //CALLED COUNTIRES
            const calledCountries = agg_query.getTemplate("terms", "attrs.dst_cc", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //EVENT CALLS TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt", domainFilter), supress);

            //ANSWER-SEIZURE RATIO TIMELINE
            const answerSeizureRatioTimeline = datehistogram_agg_sum_bucket_query.getTemplate("CallEnd", "AnsweredCalls", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            console.log(new Date + " send msearch");
            console.log(JSON.stringify(eventsOverTime));

            const response = await client.msearch({
                body: [
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    callTerminated,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    callSuccessRatio,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    queryStringTemplate,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sumCallEnd,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sumCallStart,
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
                    avgFailureRatio,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    avgMoS,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    answerSeizureRatio,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    callingCountries,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sumDurationOverTime,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxDuration,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    minDuration,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    avgDuration,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    durationGroup,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sipCodeCount,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    calledCountries,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsOverTime,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    answerSeizureRatioTimeline
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

    /**
     * @swagger
     * /api/calls/table:
     *   post:
     *     description: Get data for table
     *     tags: [Calls]
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
     *               $ref: '#/definitions/TableResponse'
     *       400:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/ChartResponseError'
     */
    static getTable(req, res, next) {
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
            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            var calls = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt", domainFilter), supress);


            const response = await client.search({
                index: 'logstash*',
                "ignore_unavailable": true,
                "preference": 1542895076143,
                body: calls

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

module.exports = CallsController;
