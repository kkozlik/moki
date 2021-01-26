/*
USE FOR:

table
datebar
query without agg
donut 


*/
function parse(response) {
    if (response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {
        return response.aggregations.agg.buckets;
    }
    return "";
}

module.exports = {
    parse: parse
};
