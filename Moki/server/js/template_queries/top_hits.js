/*
Properties:
index, timestamp from, timestamp to, type of aggregation, type filter, search query, types filter
*/
var getTemplate = function (agg) {
    var template = {
        "size": 0,
        "aggs": {
            "group": {
                "terms": {
                    "field": agg
                },
                "aggs": {
                    "group": {
                        "top_hits": {
                            "size": 1,
                            "sort": [
                                {
                                    "@timestamp": {
                                        "order": "desc"
                                    }
                                }
                            ],
                            "_source": {
                                "includes": ["email", "@timestamp"]
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
