// Connectivity.js hold the home endpoint

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

const agg_filter = require('../../js/template_queries/agg_filter.js');
const two_agg_filter_query = require('../../js/template_queries/two_agg_filter_query.js');
const heatmap_query = require('../../js/template_queries/four_agg_heatmap_query.js');


supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class ConnectivityController {

    /**
     * @swagger
     * /api/connectivity/charts:
     *   post:
     *     description: Get Connectivity charts
     *     tags: [Connectivity]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: pretty
     *         description: Return a pretty json
     *         in: query
     *         required: false
     *         type: bool
     *       - name: form
     *         description: connectivity chart form
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
            var fromTo = two_agg_filter_query.getTemplate("attrs.from.keyword", "attrs.to.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);

            //CONNECTION FAILURE RATIO 
            const failure = heatmap_query.getTemplate("attrs.from.keyword", "failure", "attrs.to.keyword", "failure", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);


            //NUMBER OF CALL-ATTEMPS 
            var callAttemps = two_agg_filter_query.getTemplate("attrs.from.keyword", "attrs.to.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-attempt", domainFilter), supress);


            //DURATION OF CALLS 
            var duration = heatmap_query.getTemplate("attrs.from.keyword", "attrs.duration", "attrs.to.keyword", "attrs.duration", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //NUMBER OF CALL-ENDS 
            var callEnds = two_agg_filter_query.getTemplate("attrs.from.keyword", "attrs.to.keyword", getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "attrs.type:call-end", domainFilter), supress);

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                fromTo,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                failure,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                callAttemps,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                duration,
                    {
                        index: 'logstash*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                callEnds
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

module.exports = ConnectivityController;
