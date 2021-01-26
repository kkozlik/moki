/*
special parse function for dateheatmap chart
*/
function parse(response) {
    if (response && response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {
        var heatmapDataParse = response.aggregations.agg.buckets;
        var heatmapDataFinal = [];

        for (var i = 0; i < heatmapDataParse.length; i++) {
            for (var j = 0; j < heatmapDataParse[i].agg.buckets.length; j++) {
                    heatmapDataFinal.push({
                        attr1: heatmapDataParse[i].key,
                        attr2: heatmapDataParse[i].agg.buckets[j].key,
                        value: heatmapDataParse[i].agg.buckets[j].agg.value
                    });
            }
        }
        return heatmapDataFinal;
    }
    return "";
}

module.exports = {
    parse: parse
};
