// special accounting queries

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
var two_agg_query = require('../../js/template_queries/two_agg_query.js');
const agg_query = require('../../js/template_queries/agg_query.js');
supress = "nofield";
var userFilter = "*";
var domainFilter = "*";

class AccountController {

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

            //EVENT TRANSPORT  TIMELINE
            const eventsOverTime = datehistogram_agg_filter_query.getTemplate("tls-cn", timebucket, getQueries("*", "*", timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //Accounting
            const accounting = two_agg_query.getTemplate("tls-cn", "sum", "count", getQueries("*", "*", timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            //LIST OF tls-cn
            const typesCount = agg_query.getTemplate("terms", 'tls-cn', getQueries("*", "*", timestamp_gte, timestamp_lte, userFilter, "*", domainFilter), supress);

            const response = await client.msearch({
                body: [
                    {
                        index: 'report*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    eventsOverTime,
                    {
                        index: 'report*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    accounting,
                    {
                        index: 'report*',
                        "ignore_unavailable": true,
                        "preference": 1542895076143
                    },
                    typesCount
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

module.exports = AccountController;
