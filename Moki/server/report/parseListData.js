function parseListData(response) {
    if (response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {
        return [response.aggregations.agg.buckets, response.aggregations.nested.value];
    }
    return ["", ""];
}
