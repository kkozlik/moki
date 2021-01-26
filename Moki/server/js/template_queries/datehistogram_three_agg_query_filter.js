var getTemplate = function (timestamp_gte, timestamp_lte, field, field2, field3, filterType, filter, types, timebucket, userFilter, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must": [

                    {
                        "range": {
                            "@timestamp": {
                                "gte": timestamp_gte,
                                "lte": timestamp_lte,
                                "format": "epoch_millis"
                            }
                        }
                    },
                    {
                        "query_string": {
                            "query": filter,
                            "analyze_wildcard": true,
                            "fuzzy_max_expansions": 0,
                            "fuzziness": 0
                        }
                    },
                    {
                        "query_string": {
                            "query": types
                        }
                    },
                    {
                        "query_string": {
                            "query": filterType
                        }
                    },
                    {
                        "query_string": {
                            "query": userFilter
                        }
                    }
                ],
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
                            "interval": timebucket,
                            "time_zone": "Europe/Berlin",
                            "min_doc_count": 1
                        },
                        "aggs": {
                            "1": {
                                "avg": {
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
