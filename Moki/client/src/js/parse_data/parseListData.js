function parse(response) {
    if (response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets && response.aggregations.nested ) {
        return [response.aggregations.agg.buckets, response.aggregations.nested.value];
    }
    return ["", ""];
}

module.exports = {
    parse: parse
};
