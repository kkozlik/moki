/*
Properties:
index, timestamp from, timestamp to, type of aggregation, type filter, search query, types filter
*/
var getTemplate = function (agg, timebucket, timestamp_gte, timestamp_lte, size, queries, supress) {
    var template = {
        "size": 0,
        track_total_hits: true,
        query: {
            bool: {
                must: queries,
                "must_not": {
                    "exists": {
                        "field": supress
                    }
                }
            }
        },
        aggs: {
            agg: {
                "date_histogram": {
                    "field": "@timestamp",
                    "fixed_interval": timebucket,
                    "time_zone": "Europe/Berlin",
                    "min_doc_count": 0,
                    "extended_bounds": {
                        "min": timestamp_gte,
                        "max": timestamp_lte
                      }
                },
                aggs: {
                    nested: { "value_count": { "field": agg } },
                    agg: {
                            terms: {
                                field: agg,
                                size: size,
                                order: {
                                    "_count": "desc"
                                }
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
