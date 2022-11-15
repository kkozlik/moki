/*
Ratio query
*/
var getTemplate = function (field1, field2, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        query: {
            bool: {
                must: queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
        "aggs": {
            "field1": {
                "sum": {
                    "field": field1
                }
            },
            "field2": {
                "sum": {
                    "field": field2
                }
            }
        }
    };
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
