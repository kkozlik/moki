var getTemplate = function (timestamp_gte, timestamp_lte, query, agg1, agg2) {
    var template = {
        "size": 0,
        track_total_hits: true,
        query: {
            bool: {

                must: [{
                        term: {
                            type: query
                        }
                },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": timestamp_gte,
                                "lte": timestamp_lte,
                                "format": "epoch_millis"
                            }
                        }
                }]
            }
        },
        "aggs": {
            "agg": {
                "terms": {
                    "field": agg1,
                    "size": 5,
                    "order": {
                        "_count": "desc"
                    }
                },
                "aggs": {
                    "agg": {
                        "terms": {
                            "field": agg2,
                            "size": 3,
                            "order": {
                                "_count": "desc"
                            }
                        }
                    }
                }
            }
        }

    };
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
