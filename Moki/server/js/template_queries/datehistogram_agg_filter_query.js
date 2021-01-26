var getTemplate = function (field, timebucket, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must":queries,
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
                    "interval": timebucket
                },
                "aggs": {
                    "agg": {
                        "terms": {
                            "field": field,
                            "size": 30,
                            "order": {
                                "_count": "desc"
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
