/*
template for geoip map

aggregations.filter_agg.agg.buckets
- agg.location (lat, lon)
- agg.doc_count
*/
var getTemplate = function (queries, supress) {
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
        "aggs" : {
            "cities" : {
                "terms" : { "field" : "geoip.city_name" },
                "aggs" : {
                    "centroid" : {
                        "geo_centroid" : { "field" : "geoip.location_all" }
                    },
                    "aggs": {
                            "terms": { "field": "attrs.type" }
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
