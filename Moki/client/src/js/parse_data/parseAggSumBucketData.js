/*
return aggregation number round to 2 decimal
*/

function parse(response) {
    if (response && response.aggregations && response.aggregations.agg && response.aggregations.agg.value) {
        var data = response.aggregations.agg.value;

        return Number((data).toFixed(2));
    }
    return "";
}

module.exports = {
    parse: parse
};
