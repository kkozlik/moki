// Conference.js hold the conference endpoint

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
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var agg_sum_bucket_query_term = require('../../js/template_queries/agg_sum_bucket_term_query.js');
var timerange_query = require('../../js/template_queries/timerange_query.js');
var sort_query = require('../../js/template_queries/sort_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class ConferenceController {

    /**
     * @swagger
     * /api/conference/charts:
     *   post:
     *     description: Get Conference charts
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
     *         description: conference chart form
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

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainfilter: " +domainFilter);

            //SUM CALL-END
            const sumCallEnd = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-leave", domainFilter), supress);

            //SUM CALL-START
            const sumCallStart = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-join", domainFilter), supress);

            //DURATION SUM
            const durationSum = agg_query.getTemplate("max", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-leave", domainFilter), supress);

            //AVERAGE DURATION
            const avgDuration = agg_query.getTemplate("avg", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-leave", domainFilter), supress);

            //AVG PARTICIPANTS
            const avgParticipants = agg_sum_bucket_query_term.getTemplate("attrs.from.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-join", domainFilter), supress);

            //TOP CONFERENCES 
            const topConferences = agg_query.getTemplate("terms", "attrs.conf_id", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-join", domainFilter), supress);

            //EVENT CONFERENCE TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-leave OR attrs.type:conf-join", domainFilter), supress);

            //ACTIVE CONFERENCES    
            const activeConf = agg_query.getTemplate("max", "attrs.count", getQueries(filters, "*", timestamp_lte - 1 * 60 * 1000, timestamp_lte, userFilter, "attrs.type:conference_room", domainFilter), supress);

            //TOP PARTICIPANTS 
            const topParticipants = agg_query.getTemplate("terms", "attrs.from.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-join", domainFilter), supress);

            //TOP ACTIVE CONFERENCES    
            const topActiveConf = sort_query.getTemplate("attrs.count", 1, getQueries(filters, "*", timestamp_lte - 1 * 60 * 1000, timestamp_lte, userFilter, "attrs.type:conference_room", domainFilter), supress);

            console.log(new Date + " send msearch");
            console.log(JSON.stringify(eventsOverTime));

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
                    avgDuration,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    avgParticipants,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topConferences,
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
                    activeConf,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topParticipants,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topActiveConf
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
    * /api/conference/table:
     *   post:
     *     description: Get data for table
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
    static getTable(req, res, next) {
        async function search() {
            const client = connectToES();

            const filters = getFiltersConcat(req.body.filters);
            const types = getTypesConcat(req.body.types);

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }

            if (req.body.timerange_lte) {
                timestamp_lte = Math.round(req.body.timerange_lte);
            }

            if (req.body.timerange_gte) {
                timestamp_gte = Math.round(req.body.timerange_gte);
            }

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            var calls = timerange_query.getTemplate(getQueries(filters, "*", timestamp_gte, timestamp_lte, userFilter, "attrs.type:conf-leave OR attrs.type:conf-join", domainFilter), supress);


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

module.exports = ConferenceController;
