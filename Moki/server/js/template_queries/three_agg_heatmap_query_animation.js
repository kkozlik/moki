var getTemplate = function (field1, field3, field4, queries, timebucket, timestamp_gte, timestamp_lte, supress) {
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
            agg: {
                "date_histogram": {
                    "field": "@timestamp",
                    "fixed_interval": timebucket,
                    "time_zone": "Europe/Berlin",
                    "min_doc_count": 0,
                    "extended_bounds": {
                        "min": timestamp_gte,
                        "max": timestamp_lte
                      }
                },
                "aggs": {
                    "agg": {
                        "terms": {
                            "field": field1
                        },
                        "aggs": {
                            "agg2": {
                                "terms": {
                                    "field": field3
                                },
                                "aggs": {
                                    "agg": {
                                        "avg": {
                                            "field": field4
                                        }
                                    }
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
