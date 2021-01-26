/*
special parse function for sunburst chart
*/

function parse(response) {
    if (response && response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {
        var sunburstDataParse = response.aggregations.agg.buckets
        var innerData = [];
        var sunburstData = [];

        for (var i = 0; i < sunburstDataParse.length; i++) {
            for (var j = 0; j < sunburstDataParse[i].agg.buckets.length; j++) {
                innerData.push({
                    key: sunburstDataParse[i].agg.buckets[j].key,
                    value: sunburstDataParse[i].agg.buckets[j].doc_count
                });

            }
            sunburstData.push({
                key: sunburstDataParse[i].key,
                value: sunburstDataParse[i].doc_count,
                children: innerData
            });
            innerData = [];
        }

        sunburstData = {
            key: "data",
            children: sunburstData
        }
        //console.log( JSON.stringify(sunburstData));
        return sunburstData;
    }
    return "";
}

module.exports = {
    parse: parse
};
