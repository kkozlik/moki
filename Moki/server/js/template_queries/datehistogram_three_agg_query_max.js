var getTemplate = function (field, field2, field3, timebucket, queries, supress) {
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
                    "field": field,
                    "size": 10,
                    "order": {
                        "1": "desc"
                    }
                },
                "aggs": {
                    "1": {
                        "avg": {
                            "field": field2
                        }
                    },
                    "2": {
                        "date_histogram": {
                            "field": "@timestamp",
                            "fixed_interval": timebucket,
                            "time_zone": "Europe/Berlin",
                            "min_doc_count": 1
                        },
                        "aggs": {
                            "1": {
                                "max": {
                                    "field": field3
                                }
                            }
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
