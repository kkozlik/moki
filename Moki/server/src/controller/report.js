// report.js hold the report endpoint

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

const query_string = require('../../js/template_queries/query_string.js');
const agg_sum_bucket_query = require('../../js/template_queries/agg_sum_bucket_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
var agg_filter = require('../../js/template_queries/agg_filter.js');
var datehistogram_query = require('../../js/template_queries/datehistogram_query.js');
var range_query = require('../../js/template_queries/range_query.js');
var multiple_query = require('../../js/template_queries/multiple_query.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var datehistogram_agg_sum_bucket_query = require('../../js/template_queries/datehistogram_agg_sum_bucket_query.js');
var timerange_query = require('../../js/template_queries/timerange_query.js');
var datehistogram_agg_query = require('../../js/template_queries/datehistogram_agg_query.js');
var path = require('path');

supress = "nofield";
var userFilter = "*";

class ReportController {

    static getReport(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = "*";
            const types = "*";
            var url = req.url;
            if (url.indexOf("lte") != -1) {
                timestamp_lte = url.substring(url.indexOf("&lte") + 5);

            }

            if (url.indexOf("gte") != -1) {
                timestamp_gte = url.substring(url.indexOf("gte") + 4, url.indexOf("&lte"));
            }

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);


            //SUM CALL-END
            const sumCallEnd = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end"), supress);


            //SUM CALL-ATTEMPT
            const sumCallAttempt = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-attempt"), supress);


            //DURATION SUM
            const durationSum = agg_query.getTemplate("sum", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);


            //ANSWER-SEIZURE RATIO
            const answerSeizureRatio = agg_sum_bucket_query.getTemplate("CallEnd", "AnsweredCalls", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //AVG MOS
            const avgMoS = agg_query.getTemplate("avg", "attrs.rtp-MOScqex-avg", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);


            //PARALLEL CALLS
            const parallelCalls = datehistogram_agg_query.getTemplate("countCall", "max", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //PARALLEL CALLS - 1 day
            const parallelCallsDayAgo = datehistogram_agg_query.getTemplate("countCall", "max", timebucket, getQueries(filters, types, (timestamp_gte - 60 * 60 * 24 * 1000), (timestamp_lte - 60 * 60 * 24 * 1000), userFilter, "*"), supress);

            //PARALLEL REGS
            const parallelRegs = datehistogram_agg_query.getTemplate("countReg", "max", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //PARALLEL REGS - 1 day
            const parallelRegsDayAgo = datehistogram_agg_query.getTemplate("countReg", "max", timebucket, getQueries(filters, types, (timestamp_gte - 60 * 60 * 24 * 1000), (timestamp_lte - 60 * 60 * 24 * 1000), userFilter, "*"), supress);

            //timestamp_lte - 1 * 60 * 1000
            //INCIDENT COUNT
            const incidentCount = datehistogram_query.getTemplate(
                timebucket,
                getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //INCIDENT COUNT -1 day
            const incidentCountDayAgo = datehistogram_query.getTemplate(
                timebucket,
                getQueries(filters, types, (timestamp_gte - 60 * 60 * 24 * 1000), (timestamp_lte - 60 * 60 * 24 * 1000), userFilter, "*"), supress);

            //DESTINATIONS CAs STATISTICS
            var statsCA = multiple_query.getTemplate("attrs.dst_ca_id", "attrs.durationMin", "CallEnd", "CallAttempts", "SumFailureSuccess", "failure", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //SIP METHOD
            const sipMethod = agg_query.getTemplate("terms", "attrs.method", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //SIP CODE
            const sipCode = agg_query.getTemplate("terms", "attrs.sip-code", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //SOURCE IP ADDRESS
            const sourceIP = agg_query.getTemplate("terms", "attrs.source", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

            //MOS HISTOGRAM
            const MoSHistogram = range_query.getTemplate("attrs.rtp-MOScqex-avg", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*"), supress);

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
            avgMoS,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                parallelCalls,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                parallelCallsDayAgo,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                parallelRegs,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                parallelRegsDayAgo,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                incidentCount,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                incidentCountDayAgo,
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
               sourceIP,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
               MoSHistogram
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

module.exports = ReportController;
