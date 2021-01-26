/*
Properties:
index, timestamp from, timestamp to, type of aggregation, filed for aggregation, script of aggregation (for duration), search query
*/
var getTemplate = function (agg_type, field, queries, supress) {
    var template = {
        "size": 1,
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
            "nested" : { "value_count" : { "field" : field } },
            "agg": {
                      [agg_type]: {
                    "field": field
                }
            }
        
    }
}
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
