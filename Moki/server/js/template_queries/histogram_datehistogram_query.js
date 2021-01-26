var getTemplate = function ( histogram,  timebucket, queries, supress) {
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
        "aggs": {
            "agg": {
                "date_histogram": {
                    "field": "@timestamp",
                    "interval": timebucket,
                    "time_zone": "Europe/Berlin",
                    "min_doc_count": 1
                },
               "aggs" : {
                    "agg" : {
                        "range" : {
                            "field" : histogram,
                            "ranges" : [
                                { "to" : 2.58 },
                                { "from" : 2.58, "to" : 3.1 },
                                { "from" : 3.1, "to": 3.6 },
                                { "from" : 3.6, "to": 4.03 },
                                { "from" : 4.03 }
                            ]
                        }
                    }
               }
            }
        }
    }
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
