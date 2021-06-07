var getTemplate = function (field1, field2, field3, field4, timebucket, timestamp_gte, timestamp_lte, queries, supress, agg_type="avg") {
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
                "date_histogram": {
                    "field": "@timestamp",
                    "interval": timebucket,
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
                            "field": field1,
                            "size": 20,
                            "order": {
                                "agg": "desc"
                            }
                        },
                        "aggs": {
                            "agg": {
                                [agg_type]: {
                                    "field": field2
                                }
                            },
                            "agg2": {
                                "terms": {
                                    "field": field3,
                                    "size": 5,
                                    "order": {
                                        "agg": "desc"
                                    }
                                },
                                "aggs": {
                                    "agg": {
                                        [agg_type]: {
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
