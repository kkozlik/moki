var getTemplate = function ( field, queries, supress) {
    var template = {
        "size": 0,
        "track_total_hits": true,
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
            "distinct": {
                "cardinality": {
                    "field": field
                }
            }
        }
    };
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
