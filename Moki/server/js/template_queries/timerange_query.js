var getTemplate = function (queries, supress, source, size = 500) {
    var template = {
        "size": size,
        "track_total_hits": true,
        "sort": [
            {
                "@timestamp": {
                    "order": "desc",
                    "unmapped_type": "boolean"
                }
            },
            { "attrs.type": { "order": "asc" } }
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

    if (source !== "*") {
        template._source = source;
    }
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
