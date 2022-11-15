var getTemplate = function (field1, field2, queries, supress, order = "_count") {
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
                    "agg": {
                        "max": {
                            "field": field2
                        }
                    },
                    "agg2": {
                          "min": {
                            "field": field2
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
