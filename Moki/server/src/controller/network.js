// network.js hold the home endpoint

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


const agg_query = require('../../js/template_queries/agg_query.js');
var timerange_query = require('../../js/template_queries/timerange_query.js');
var datehistogram_three_agg_query = require('../../js/template_queries/datehistogram_three_agg_query.js');

supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class networkController {

    /**
     * @swagger
     * /api/network/charts:
     *   post:
     *     description: Get network charts
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

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            console.info("SERVER search with filters: " + filters + " types: " + types + " timerange: " + timestamp_gte + "-" + timestamp_lte + " timebucket: " + timebucket + " userFilter: " + userFilter + " domainFilter: "+domainFilter);


            //CALLS BY HOST
            const callsByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'attrs.calls', 'attrs.calls', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //REGS BY HOST
            const regsByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'attrs.regs', 'attrs.regs', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //CALL STARTS BY HOST
            const callStartsByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'attrs.callstarts', 'attrs.callstarts', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //RELAYED RTP BY HOST
            const relayedRtpByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'attrs.bits', 'attrs.bits', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //RX BYTES BY HOST
            const rxBytesByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'rx', 'rx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_octets", domainFilter), supress);

            //TX BYTES BY HOST
            const txBytesByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'tx', 'tx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_octets", domainFilter), supress);

            //RX PACKET BY HOST
            const rxPacketByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'rx', 'rx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_packets", domainFilter), supress);

            //TX PACKET BY HOST
            const txPacketByHost = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'tx', 'tx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_octets", domainFilter), supress);

            //RX BYTES BY INTERFACE
            const rxBytesByInterface = datehistogram_three_agg_query.getTemplate('type_instance', 'rx', 'rx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_octets", domainFilter), supress);

            //TX BYTES BY INTERFACE
            const txBytesByInterface = datehistogram_three_agg_query.getTemplate('type_instance', 'tx', 'tx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_octets", domainFilter), supress);

            //RX PACKETS BY INTERFACE
            const rxPacketByInterface = datehistogram_three_agg_query.getTemplate('type_instance', 'rx', 'rx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_packets", domainFilter), supress);

            //TX PACKETS BY INTERFACE
            const txPacketByInterface = datehistogram_three_agg_query.getTemplate('type_instance', 'tx', 'tx', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND attrs.type:if_packets", domainFilter), supress);

            //IPS ON FW BLACKLIST BY HOST
            const blacklist = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND plugin_instance:blacklist", domainFilter), supress);

            //IPS ON FW GREYLIST BY HOST
            const greylist = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND plugin_instance:greylist", domainFilter), supress);

            //IPS ON FW WHITELIST BY HOST
            const whitelist = datehistogram_three_agg_query.getTemplate('attrs.hostname', 'value', 'value', timebucket, getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd AND plugin_instance:whitelist", domainFilter), supress);


            console.log(new Date + " send msearch");

            const response = await client.msearch({
                body: [
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
            callsByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                regsByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                callStartsByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                relayedRtpByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                rxBytesByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                txBytesByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                rxPacketByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                txPacketByHost,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                 rxBytesByInterface,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                 txBytesByInterface,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                 rxPacketByInterface,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                 txPacketByInterface,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                 blacklist,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                 greylist,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                },
                 whitelist,
                    {
                        index: 'collectd*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                }

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
     * /api/network/table:
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
     *         description: Network chart form
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

            var timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);

            var calls = timerange_query.getTemplate(getQueries(filters, types, timestamp_gte, timestamp_lte, userFilter, "tags:collectd NOT attrs.type:memory AND NOT attrs.type:percent AND  NOT attrs.type:realm_counters AND NOT attrs.type:global_counters", domainFilter), supress);


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

module.exports = networkController;
