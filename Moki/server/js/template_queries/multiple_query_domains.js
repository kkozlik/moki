var getTemplate = function (field1, field2, field3, field4, field5, field6, queries, supress, order = "_count") {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must": queries
            }
        },

        "aggs": {
            "agg": {
                "terms": {
                    "field": field1,
                    "size": 100,
                    "order": {
                        [order]: "desc"
                    }
                },
                "aggs": {
                    "agg2": {
                        "sum": {
                            "field": field2
                        }
                    },
                    "agg3": {
                          "cardinality": {
                            "field": field3
                          }
                        
                      },
                      "agg4": {
                        "cardinality": {
                          "field": field4
                        }
                    },
                    "agg5": {
                        "sum": {
                            "field": field5
                        }
                    },
                    "agg6": {
                        "sum": {
                            "field": field6
                        }
                    },
                }
            }
        }


    }
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
