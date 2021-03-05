var getTemplate = function (queries, supress, size = 500) {
    var template = {
        size: size,
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
