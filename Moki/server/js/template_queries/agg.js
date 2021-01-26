/*
Properties:
index, timestamp from, timestamp to, type of aggregation, type filter, search query, types filter
*/
var getTemplate = function ( agg, queries, supress) {
    var template = {
        "size": 0,
        _source: "attrs.from",
        track_total_hits: true,
        query: {
            bool: {
                must: queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
        aggs: {
            "nested" : { "value_count" : { "field" : agg } },
            agg: {
                terms: {
                    field: agg,
                    size: 10,
                    order: {
                        "_count": "desc"
                    }
                }
            }
        }
    };
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
