// realm.js hold the realm endpoint

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

var timerange_query = require('../../js/template_queries/timerange_query.js');
var datehistogram_three_agg_query_max = require('../../js/template_queries/datehistogram_three_agg_query_max.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class realmController {

    /**
     * @swagger
     * /api/realm/charts:
     *   post:
     *     description: Get realm charts
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

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: "+domainFilter);


            //MAX CALLS FROM BY HOST
            const maxCallsFromByHost = datehistogram_three_agg_query_max.getTemplate('attrs.hostname', 'attrs.callfrom', 'attrs.callfrom', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX CALLS To BY HOST
            const maxCallsToByHost = datehistogram_three_agg_query_max.getTemplate('attrs.hostname', 'attrs.callsto', 'attrs.callsto', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX CALLS FROM BY REALM
            const maxCallsFromByrealm = datehistogram_three_agg_query_max.getTemplate('attrs.realm', 'attrs.callfrom', 'attrs.callfrom', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX CALLS TO BY REALM
            const maxCallsToByrealm = datehistogram_three_agg_query_max.getTemplate('attrs.realm', 'attrs.callsto', 'attrs.callsto', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX START CALLS FROM BY HOST
            const maxStartCallsFromByHost = datehistogram_three_agg_query_max.getTemplate('attrs.hostname', 'attrs.callstartfrom', 'attrs.callstartfrom', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX START CALLS To BY HOST
            const maxStartCallsToByHost = datehistogram_three_agg_query_max.getTemplate('attrs.hostname', 'attrs.callstartto', 'attrs.callstartto', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX START CALLS FROM BY REALM
            const maxStartCallsFromByrealm = datehistogram_three_agg_query_max.getTemplate('attrs.realm', 'attrs.callstartfrom', 'attrs.callstartfrom', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //MAX START CALLS TO BY REALM
            const maxStartCallsToByrealm = datehistogram_three_agg_query_max.getTemplate('attrs.realm', 'attrs.callstartto', 'attrs.callstartto', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //RTP RELAYED TO BY HOST
            const rtpToByHost = datehistogram_three_agg_query_max.getTemplate('attrs.hostname', 'attrs.bitsto', 'attrs.bitsto', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //RTP RELAYED FROM BY HOST
            const rtpFromByHost = datehistogram_three_agg_query_max.getTemplate('attrs.hostname', 'attrs.bitsfrom', 'attrs.bitsfrom', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //RTP RELAYED TO BY REALM
            const rtpToByRealm = datehistogram_three_agg_query_max.getTemplate('attrs.realm', 'attrs.bitsto', 'attrs.bitsto', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //RTP RELAYED FROM BY REALM
            const rtpFromByRealm = datehistogram_three_agg_query_max.getTemplate('attrs.realm', 'attrs.bitsfrom', 'attrs.bitsfrom', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);




            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxCallsFromByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxCallsToByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxCallsFromByrealm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxCallsToByrealm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxStartCallsFromByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxStartCallsToByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxStartCallsFromByrealm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    maxStartCallsToByrealm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    rtpToByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    rtpFromByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    rtpToByRealm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    rtpFromByRealm
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
  * /api/realm/table:
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
  *         description: Realm chart form
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
            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }
            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            var calls = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:realm_counters OR attrs.type:global_counters", domainFilter), supress);


            const response = await client.search({
                index: 'collectd*',
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

module.exports = realmController;
