var getTemplate = function ( field, queries, supress) {
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
            "count_bucket": {
                "terms": {
                    "field": field,
                    "size": 500,
                    "order": {
                        "_key": "desc"
                    }
                },
                 "aggs": {
                "docs_count": {
                    "value_count": {
                        "field": field
                    }
                }
            }
            },
            "avg_count": {
                  "avg_bucket": {
                    "buckets_path": "count_bucket>docs_count" 
                  }
            }
        }
    }
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
