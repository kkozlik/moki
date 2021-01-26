// system.js hold the system endpoint

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
var datehistogram_three_agg_query = require('../../js/template_queries/datehistogram_three_agg_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class systemController {

    /**
     * @swagger
     * /api/system/charts:
     *   post:
     *     description: Get system charts
     *     tags: [System]
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

            //LOAD-SHORTTERM
            const shortterm = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'shortterm', 'shortterm', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd AND attrs.type:load", domainFilter), supress);

            //LOAD-midTERM
            const midterm = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'midterm', 'midterm', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd AND attrs.type:load", domainFilter), supress);

            //LOAD-LONGTERM
            const longterm = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'longterm', 'longterm', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd AND attrs.type:load", domainFilter), supress);

            //MEMORY FREE
            const memoryFree = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd  AND plugin:memory AND type_instance:free", domainFilter), supress);

            //MEMORY USED
            const memoryUsed = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd  AND plugin:memory AND  type_instance:used", domainFilter), supress);

            //MEMORY CACHED
            const memoryCached = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd  AND plugin:memory AND type_instance:cached", domainFilter), supress);

            //MEMORY BUFFERED
            const memoryBuffered = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd  AND plugin:memory AND type_instance:buffered", domainFilter), supress);

            //UAS
            const uas = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'attrs.uas_trans', 'attrs.uas_trans', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "*", domainFilter), supress);

            //UAC
            const uac = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'attrs.uac_trans', 'attrs.uac_trans', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "*", domainFilter), supress);

            //CPU-USER
            const cpuUser = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd  AND plugin:cpu AND  type_instance:user", domainFilter), supress);

            //CPU-SYSTEM
            const cpuSystem = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd  AND plugin:cpu AND type_instance:system", domainFilter), supress);

            //CPU-IDLE
            const cpuIdle = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd  AND plugin:cpu AND type_instance:idle", domainFilter), supress);



            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    shortterm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    midterm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    longterm,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    memoryFree,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    memoryUsed,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    memoryCached,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    memoryBuffered,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    uas,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    uac,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    cpuUser,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    cpuSystem,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    cpuIdle

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
     * /api/system/table:
     *   post:
     *     description: Get data for table
     *     tags: [System]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: System chart form
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

            var calls = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, "*", "tags:collectd AND NOT type_instance:fSBCCallsTimeout AND NOT type_instance:fSBCRegsTimeout AND NOT attrs.type:realm_counters AND NOT attrs.type:global_counters", domainFilter), supress);


            const response = await client.search({
                index: 'collectd*',
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

module.exports = systemController;
