var getTemplate = function (field1, field3, field4, queries, supress) {
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
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
