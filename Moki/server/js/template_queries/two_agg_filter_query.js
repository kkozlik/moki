/*
Properties:
index, timestamp from, timestamp to, type of aggregation, type of subaggregation, search query, types
*/
var getTemplate = function (agg, subagg, queries, supress) {
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
                    "size": 5,
                    "order": {
                        "_count": "desc"
                    }
                },
                "aggs": {
                    "agg": {
                        "terms": {
                            "field": subagg,
                            "size": 3,
                            "order": {
                                "_count": "desc"
                            }

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
