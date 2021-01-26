var getTemplate = function (histogram_field, field, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "sort" : [
            {
                [field] : {"order" : "asc", "mode" : "max"}
            }
        ],
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
            "agg": {
                "histogram": {
                    "field": histogram_field,
                    "interval": 0.5,
                    "min_doc_count": 1
                },
                "aggs": {
                    "agg": {
                        "sum": {
                            "field": field
                        }
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
