var getTemplate = function (queries, supress) {
    var template = {
        size: 500,
        "track_total_hits": true,
        "sort": [
            {
                "@timestamp": {
                    "order": "desc",
                    "unmapped_type": "boolean"
                }
            }
            ],
        "query": {
            "bool": {
                "must": queries,
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
