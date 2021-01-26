/*
Properties:
index, timestamp from, timestamp to, type of aggregation, type of subaggregation, search query, types
*/
var getTemplate = function (agg, cardinalityField, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must": queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
        "aggs": {
            "agg": {
                "terms": {
                    "field": agg,
                    "size": 10,
                    "order": {
                        "agg": "desc"
                    }
                },
                "aggs": {
                    "agg": {
                        "cardinality": {
                            "field": cardinalityField
                        }
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
