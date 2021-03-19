var getTemplate = function (negationField, queries, supress) {
    if (negationField != "*") {
        var template = {
            "size": 0,
            "track_total_hits": true,
            "query": {
                "bool": {
                    "must": queries,
                    "must_not": {
                        "match": {
                            "encrypt": negationField
                        }
                    }
                }
            }
        };
    } else {
        var template = {
            "size": 0,
            "track_total_hits": true,
            "query": {
                "bool": {
                    "must": queries
                }
            }
        };
    }

    console.log(JSON.stringify(template));
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
