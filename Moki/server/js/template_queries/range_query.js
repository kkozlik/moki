var getTemplate = function (field, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        "query": {
            "bool": {
                "must": queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
  "aggs" : {
        "agg" : {
            "range" : {
                "field" : field,
                "ranges" : [
                    { "to" : 2.58 },
                    { "from" : 2.58, "to" : 3.10 },
                    { "from" : 3.10, "to" : 3.6 },
                    { "from" : 3.6, "to" : 4.03 },
                    { "from" : 4.03 }
                ]
            }
        }
    }
    }
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
