var getTemplate = function ( field, field2, queries, supress) {
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
                "sum_bucket": {
                    "buckets_path": "1-bucket>1-metric"
                }
            },
            "1-bucket": {
                "terms": {
                    "field": field,
                    "size": 500,
                    "order": {
                        "_key": "desc"
                    }
                },
                "aggs": {
                    "1-metric": {
                        "avg": {
                            "field": field2
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
