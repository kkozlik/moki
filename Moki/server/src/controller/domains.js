// Domains.js hold the Domains endpoint

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

var agg_filter = require('../../js/template_queries/agg_filter.js');
const timerange_query = require('../../js/template_queries/timerange_query.js');
const query_string = require('../../js/template_queries/query_string.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class DomainsController {

    /**
     * @swagger
     * /api/domains/charts:
     *   post:
     *     description: Get domains charts
     *     tags: [Domains]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: Domains chart form
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
            console.log(`SERVER search with filters: ${filters} types: ${types} ` +
                `timerange: ${timestamp_gte}-${timestamp_lte} ` +
                ` timebucket: ${timebucket} diff: ${(timestamp_lte - timestamp_gte)}`);

            //TOP DOMAINS
            const topDomains = agg_filter.getTemplate('tls-cn', getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, '*', domainFilter), supress);

            //TABLE TODO: specific type
            var table = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //SUM ALL EVENTS
            const sumAll = query_string.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //TABLE FOR LAST LOGINS
            var tableLastLogin = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [{
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    topDomains,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    table,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    sumAll,
                    {
                        index: 'lastlog*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    tableLastLogin
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

module.exports = DomainsController;