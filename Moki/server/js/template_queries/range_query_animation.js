var getTemplate = function (field, queries, timebucket, timestamp_gte, timestamp_lte, supress) {
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
                        "range": {
                            "field": field,
                            "ranges": [
                                { "to": 2.58 },
                                { "from": 2.58, "to": 3.10 },
                                { "from": 3.10, "to": 3.6 },
                                { "from": 3.6, "to": 4.03 },
                                { "from": 4.03 }
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
