// ConnectivityCA.js hold the ConnectivityCA endpoint

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
const agg_query = require('../../js/template_queries/agg_query.js');
const two_agg_filter_query = require('../../js/template_queries/two_agg_filter_query.js');
const heatmap_query_three =require('../../js/template_queries/three_agg_heatmap_query.js');
const heatmap_query_three_animation =require('../../js/template_queries/three_agg_heatmap_query_animation.js');
const heatmap_query = require('../../js/template_queries/four_agg_heatmap_query.js');
const multiple_query = require('../../js/template_queries/multiple_query.js');
const datehistogram_two_agg_query = require('../../js/template_queries/datehistogram_two_agg_query.js');
const datehistogram_four_agg_query = require('../../js/template_queries/datehistogram_four_agg_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class ConnectivityCAController {

    /**
     * @swagger
     * /api/connectivityCA/charts:
     *   post:
     *     description: Get ConnectivityCA charts
     *     tags: [ConnectivityCA]
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

                        //check if domain fiter should be use
                        var isDomainFilter = await getJWTsipUserFilter(req);
                        if (isDomainFilter.domain) {
                            domainFilter = isDomainFilter.domain;
                        }
            

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainfilter: " +domainFilter);

            //topology chart
            var fromToCA = two_agg_filter_query.getTemplate("attrs.src_ca_id", "attrs.dst_ca_id", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt", domainFilter), supress);

            //DURATION SUM
            const durationSum = agg_query.getTemplate("sum", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SUM CALL-END
            const sumCallEnd = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);


            //SUM CALL-ATTEMPT
            const sumCallAttempt = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-attempt", domainFilter), supress);

            //CONNECTION FAILURE RATIO CA
            const failureCA = heatmap_query.getTemplate("attrs.src_ca_id", "failure", "attrs.dst_ca_id", "failure", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //NUMBER OF CALL-ATTEMPS CA
            var callAttempsCA = two_agg_filter_query.getTemplate("attrs.src_ca_id", "attrs.dst_ca_id", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-attempt", domainFilter), supress);

            //NUMBER OF CALL-ENDS CA
            var callEndsCA = two_agg_filter_query.getTemplate("attrs.src_ca_id", "attrs.dst_ca_id", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);

            //DURATION OF CALLS CA
            var durationCA = heatmap_query_three.getTemplate("attrs.src_ca_id", "attrs.dst_ca_id", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //ERROR CODE ANALYSIS
            const codeAnalysis = heatmap_query.getTemplate("attrs.sip-code", "failure", "attrs.src_ca_id", "failure", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //CA RATIO HISTORY
            const ratioHistory = datehistogram_two_agg_query.getTemplate("attrs.dst_ca_id", "failure", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //CA AVAILABILITY
            const caAvailability = datehistogram_two_agg_query.getTemplate("attrs.dest_ca_name", "StatesCA", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress, "max");

            //DESTINATIONS CAs STATISTICS
            var statsCA = multiple_query.getTemplate("attrs.dst_ca_id", "attrs.duration", "CallEnd", "CallAttempts", "SumFailureSuccess", "failure", "AnsweredCalls", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SOURCE CAs STATISTICS
            var sourceStatsCA = multiple_query.getTemplate("attrs.src_ca_id", "attrs.duration", "CallEnd", "CallAttempts", "SumFailureSuccess", "failure", "AnsweredCalls", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SUM CALL-START
            const sumCallStart = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-start", domainFilter), supress);

            //AVG MoS
            const avgMoS = datehistogram_two_agg_query.getTemplate("attrs.dst_ca_id", "attrs.rtp-MOScqex-avg", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                fromToCA,
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
                failureCA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                callAttempsCA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                callEndsCA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                codeAnalysis,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                ratioHistory,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                caAvailability,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                durationCA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                statsCA,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                sourceStatsCA,
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
                avgMoS
            ]
            }).catch((err) => {
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
     * /api/connectivityCA/connection_failure_ratio_ca:
     *   post:
     *     description: Get connection failure ratio CA data based on time buckets
     *     tags: [ConnectivityCA]
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

    static getConnectionFailureRatioCA(req, res, next) {
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
            //video length 30 sec
            var timebucket =  (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);
            //CA RATIO HISTORY - animation
            const ratioAnimation = datehistogram_four_agg_query.getTemplate("attrs.src_ca_id", "failure", "attrs.dst_ca_id", "failure", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            const response = await client.msearch({
                body: [
                {
                    index: 'logstash*',
                    "ignore_unavailable": true,
                    "preference": 1542895076143
            },
                ratioAnimation
            ]
            }).catch((err) => {
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
     * /api/connectivityCA/error_code_analysis:
     *   post:
     *     description: Get connection error code analysis data based on time buckets
     *     tags: [ConnectivityCA]
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

    static getErrorCodeAnalysis(req, res, next) {
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
            //video length 30 sec
            var timebucket =  (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            const ratioAnimation = datehistogram_four_agg_query.getTemplate("attrs.sip-code", "failure", "attrs.src_ca_id", "failure", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const response = await client.msearch({
                body: [
                {
                    index: 'logstash*',
                    "ignore_unavailable": true,
                    "preference": 1542895076143
            },
                ratioAnimation
            ]
            }).catch((err) => {
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
     * /api/connectivityCA/number_of_call-attemps_ca:
     *   post:
     *     description: Get number of call-attempts CA data based on time buckets
     *     tags: [ConnectivityCA]
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

    static getNumberOfCallAttemptsCA(req, res, next) {
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
            
            //video length 30 sec
            var timebucket =  (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);
            //CA RATIO HISTORY - animation
            const attemptAnimation =  datehistogram_two_agg_query.getTemplate("attrs.dst_ca_id", "attrs.src_ca_id", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-attempt", domainFilter), supress, "terms");


            const response = await client.msearch({
                body: [
                {
                    index: 'logstash*',
                    "ignore_unavailable": true,
                    "preference": 1542895076143
            },
            attemptAnimation
            ]
            }).catch((err) => {
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
     * /api/connectivityCA/duration_of_calls_ca_(avg):
     *   post:
     *     description: Get number of duration of calls CA (avg) based on timebucket
     *     tags: [ConnectivityCA]
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

    static getDurationCA(req, res, next) {
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
            
            //video length 30 sec
            var timebucket =  (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);
            //DURATION OF CALLS CA
            var durationCA = heatmap_query_three_animation.getTemplate("attrs.src_ca_id", "attrs.dst_ca_id", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), timebucket, timestamp_gte, timestamp_lte, supress);


            const response = await client.msearch({
                body: [
                {
                    index: 'logstash*',
                    "ignore_unavailable": true,
                    "preference": 1542895076143
            },
            durationCA
            ]
            }).catch((err) => {
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
     * /api/connectivityCA/from_to_ca:
     *   post:
     *     description: Get number of topology chart data based on time buckets
     *     tags: [ConnectivityCA]
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

    static getFromToCA(req, res, next) {
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
            
            //video length 30 sec
            var timebucket =  (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            const attemptAnimation =  datehistogram_two_agg_query.getTemplate("attrs.src_ca_id", "attrs.dst_ca_id", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end OR attrs.type:call-start OR attrs.type:call-attempt", domainFilter), supress, "terms");

            const response = await client.msearch({
                body: [
                {
                    index: 'logstash*',
                    "ignore_unavailable": true,
                    "preference": 1542895076143
            },
            attemptAnimation
            ]
            }).catch((err) => {
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
     * /api/connectivityCA/number_of_call-ends_ca:
     *   post:
     *     description: Get number of call-ends CA data based on time buckets
     *     tags: [ConnectivityCA]
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

    static getNumberOfCallEndsCA(req, res, next) {
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
            
            //video length 30 sec
            var timebucket =  (timestamp_lte - timestamp_gte) / 30000;
            timebucket = Math.round(timebucket) + "s";

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);
            //CA RATIO HISTORY - animation
            const attemptAnimation =  datehistogram_two_agg_query.getTemplate("attrs.dst_ca_id", "attrs.src_ca_id", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress, "terms");


            const response = await client.msearch({
                body: [
                {
                    index: 'logstash*',
                    "ignore_unavailable": true,
                    "preference": 1542895076143
            },
            attemptAnimation
            ]
            }).catch((err) => {
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

module.exports = ConnectivityCAController;
