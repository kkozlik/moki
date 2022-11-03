var getTemplate = function (queries, supress, source, shouldSortByTime, size = 500) {
   let sort = [{
        "@timestamp": {
            "order": "desc",
            "unmapped_type": "boolean"
        }
    },
    { "attrs.type": { "order": "asc" } }]
    if(!shouldSortByTime){
        sort = [{
            "@timestamp": {
                "order": "desc",
                "unmapped_type": "boolean"
            }
        }]
    }
    var template = {
        "size": size,
        "track_total_hits": true,
        "sort": sort,
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
