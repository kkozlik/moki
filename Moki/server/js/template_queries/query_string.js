var getTemplate = function ( queries, supress) {
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
        }
    };
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
