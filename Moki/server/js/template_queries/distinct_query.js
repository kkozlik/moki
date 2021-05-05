var getTemplate = function (field, domainFilter) {
    if (domainFilter && domainFilter !== "*") {
        var template = {
            "size": 0,
            "query": {
                "query_string": {
                    "query": domainFilter
                }
            },
            "aggs": {
                "distinct": {
                    "terms": {
                        "field": field
                    }
                }
            }
        };
    } else {
        var template = {
            "size": 0,
            "aggs": {
                "distinct": {
                    "terms": {
                        "field": field
                    }
                }
            }
        };

    }
    return template;
}

module.exports = {
    getTemplate: getTemplate
};
