// diagnostics.js hold the home endpoint

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
var date_bar = require('../../js/template_queries/date_bar_query.js');
var datehistogram_agg_filter_query = require('../../js/template_queries/datehistogram_agg_filter_query.js');
var timerange_query = require('../../js/template_queries/timerange_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class diagnosticsController {

    /**
     * @swagger
     * /api/diagnostics/charts:
     *   post:
     *     description: Get diagnostics charts
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
     *         description: Diagnostics chart form
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
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("attrs.type", timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:alert OR attrs.type:error OR attrs.type:message-log OR attrs.type:action-log OR attrs.type:prompt OR attrs.type:recording OR attrs.type:notice", domainFilter), supress);

            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsOverTime,

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
     * /api/diagnostics/table:
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
     *         description: Diagnostics chart form
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

            var data = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:alert OR attrs.type:error OR attrs.type:message-log OR attrs.type:action-log OR attrs.type:prompt OR attrs.type:recording OR attrs.type:notice", domainFilter), supress);


            const response = await client.search({
                index: 'logstash*',
                "ignore_unavailable": true,
                "preference": 1542895076143,
                body: data

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

module.exports = diagnosticsController;
