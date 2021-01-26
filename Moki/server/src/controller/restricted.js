// restricted.js hold the restricted endpoint

const {
    getFiltersConcat,
    getTypesConcat,
    getQueries
} = require('../utils/metrics');
const { getJWTsipUserFilter } = require('../modules/jwt');
const {
    connectToES
} = require('../modules/elastic');

let {
    getTimestampBucket,
    timestamp_gte,
    timestamp_lte
} = require('../utils/ts');


var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
const query_string = require('../../js/template_queries/query_string.js');
const agg_sum_bucket_query = require('../../js/template_queries/agg_sum_bucket_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
const timerange_query = require('../../js/template_queries/timerange_query.js');
var date_bar = require('../../js/template_queries/date_bar_query.js');
var range_query = require('../../js/template_queries/range_query.js');
supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class restrictedController {

    /**
     * @swagger
     * /api/restricted/charts:
     *   post:
     *     description: Get restricted charts, in AWS after no-admin user login
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
     *         description: Restricted chart form
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

            userFilter = await getJWTsipUserFilter(req);
            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);

            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);

             //SUM CALL-END
            const sumCallEnd = query_string.getTemplate(
                getQueries(filters, types, timestamp_gte, timestamp_lte,
                    userFilter, "attrs.type:call-end", domainFilter), supress);

             //SUM CALL-ATTEMPT
            const sumCallAttempt = query_string.getTemplate(
                getQueries(filters, types, timestamp_gte, timestamp_lte,
                    userFilter, "attrs.type:call-attempt", domainFilter), supress);

            //CALLING COUNTRIES
            const callingCountries = agg_query.getTemplate("terms", "geoip.country_code2", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

             //DURATION SUM 
            const durationSum = agg_query.getTemplate(
                "sum", "attrs.duration",
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

             //ANSWER-SEIZURE RATIO
            const answerSeizureRatio = agg_sum_bucket_query.getTemplate(
                "CallEnd", "AnsweredCalls",
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //AVG DURATION
            const avgDuration = agg_query.getTemplate(
                "avg", "attrs.duration",
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SUM DURATION OVER TIME
            const sumDurationOverTime = date_bar.getTemplate("attrs.duration", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //FROM UA
            const fromUA = agg_query.getTemplate("terms", "attrs.from-ua", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SOURCE IP ADDRESS
            const sourceIP = agg_query.getTemplate("terms", "attrs.source", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //EVENT CALLS TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            //EVENT EXCEEDED TIMELINE
            const eventsOverTimeExceeded = datehistogram_agg_filter_query.getTemplate("exceeded", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

             //TOP 10 TO
             const top10to = agg_query.getTemplate("terms", "attrs.to.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

              //AVG MoS
            const avgMoS = agg_query.getTemplate("avg", "attrs.rtp-MOScqex-avg", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            console.log(new Date + " send msearch");


            const response = await client.msearch({
                body: [
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
                    sumCallAttempt,
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
                    durationSum,
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
                    avgDuration,
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
                    fromUA,
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
                    eventsOverTime,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsOverTimeExceeded,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    top10to,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    avgMoS
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
     * /api/restricted/calls:
     *   post:
     *     description: Get data for calls, in AWS after no-admin user login
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
    static getCalls(req, res, next) {
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

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }
            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);
            userFilter = await getJWTsipUserFilter(req);

            var calls = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt OR attrs.type:message-dropped OR attrs.type:auth-failed OR attrs.type:limit OR attrs.type:reg-new OR attrs.type:reg-expired OR attrs.type:reg-del", domainFilter), supress);


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

    /**
     * @swagger
     * /api/restricted/table:
     *   post:
     *     description: Get data for table, in AWS after no-admin user login
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
     *         description: Restricted chart form
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
            userFilter = await getJWTsipUserFilter(req);

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }
            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            var calls = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const response = await client.search({
                index: 'exceeded*',
                "ignore_unavailable": true,
                "preference": 1542895076143,
                body: calls

            });
            client.close();
            return res.json(response);

        }

        return search().catch(e => {
            return next(e);
        });


    }

}

module.exports = restrictedController;
