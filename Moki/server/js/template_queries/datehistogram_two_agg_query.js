var getTemplate = function (field, field2, timebucket, queries, supress, agg_type="avg") {
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
                    "min_doc_count": 1
                },
                "aggs": {
                    "agg": {
                        "terms": {
                            "field": field,
                            "size": 20
                        },
                        "aggs": {
                            "agg": {
                                [agg_type]: {
                                    "field": field2
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
