/*
Properties:
index, timestamp from, timestamp to, type of aggregation, filed for aggregation, script of aggregation (for duration), search query
*/
var getTemplate = function (field, field2, queries, supress) {
    var template = {
        "size": 1,
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
                        "field": field
                    },
                    "aggs": {
                        "group_docs": {
                            "top_hits": {
                                "size": 1,
                                "sort": [
                                    {
                                        "@timestamp": {
                                            "order": "desc"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }
    return template;
}

module.exports = {
    getTemplate: getTemplate
};