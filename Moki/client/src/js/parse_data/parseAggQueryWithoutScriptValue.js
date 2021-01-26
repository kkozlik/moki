function parse(response) {
    if (response && response.aggregations && response.aggregations.agg) {
        return response.aggregations.agg.value;
    }
    return 0;
}

module.exports = {
    parse: parse
};
