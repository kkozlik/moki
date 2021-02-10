/*
USE FOR:

table
datebar
query without agg
donut 


*/
export default function parseBucketData(response) {
    if (response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {
        return response.aggregations.agg.buckets;
    }
    return "";
}


