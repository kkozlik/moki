var getTemplate = function (negationField, queries, supress) {
    let template = {
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

    //anonymous mode - count only plain text
    if (negationField === "anonymous") {
        queries.push({
            "match": {
                "encrypt": "plain"
            }
        })
        template = {
            "size": 0,
            "track_total_hits": true,
            "query": {
                "bool": {
                    "must": queries
                }
            }
        };
    }
    else if (negationField === "*") {
        template = {
            "size": 0,
            "track_total_hits": true,
            "query": {
                "bool": {
                    "must": queries
                }
            }
        };
    }

    return template;
}

module.exports = {
    getTemplate: getTemplate
};
