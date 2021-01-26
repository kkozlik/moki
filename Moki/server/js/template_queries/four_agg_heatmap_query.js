var getTemplate = function ( field1, field2, field3, field4, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must":  queries,
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
                    "field": field1,
                    "size": 20,
                    "order": {
                        "agg": "desc"
                    }
                },
                "aggs": {
                    "agg": {
                        "avg": {
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
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
