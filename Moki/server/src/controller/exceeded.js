// exceeded.js hold the exceeded endpoint

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

var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var timerange_query = require('../../js/template_queries/timerange_query.js');
var agg = require('../../js/template_queries/agg.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class exceededController {

    /**
     * @swagger
     * /api/exceeded/charts:
     *   post:
     *     description: Get exceeded (alarms) charts 
     *     tags: [Exceeded]
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

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter);

            //EVENT TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("exceeded", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //INCIDENT COUNT
            const exceededCount = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //EXCEEDED TYPE
            const exceededType = agg.getTemplate("exceeded", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOP OFFENDERS BY COUNT
            const topOffenders = agg.getTemplate("attrs.from.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //EVENTS BY IP ADDR EXCEEDED
            const ipAddress = agg.getTemplate("attrs.source", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TOP SUBNETS /24 EXCEEDED
            const subnets = agg.getTemplate("attrs.sourceSubnets", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsOverTime,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    exceededCount,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    exceededType,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topOffenders,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    ipAddress,
                    {
                        index: 'exceeded*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    subnets

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
     * /api/exceeded/table:
     *   post:
     *     description: Get data for table
     *     tags: [Exceeded]
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
            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = isDomainFilter.domain;
            }
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

module.exports = exceededController;
