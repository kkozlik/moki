/*
special stackedbar parse function

format: [value1: number, value2: number, time:timestamp, keys:[value1, value2], max: value
*/
function parse(response) {
    if (response && response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {

        var stackedbarDataParse = response.aggregations.agg.buckets;
        var innerData = {};
        var stackedbarData = [];
        var sum = 0;

        for (var i = 0; i < stackedbarDataParse.length; i++) {
            for (var j = 0; j < stackedbarDataParse[i].agg.buckets.length; j++) {
                var keyy = stackedbarDataParse[i].agg.buckets[j].key;
                var value = stackedbarDataParse[i].agg.buckets[j].doc_count;

                innerData[keyy] = value;
                sum = sum + value

            }

            innerData['time'] = stackedbarDataParse[i].key;
            innerData['value'] = stackedbarDataParse[i].value;
            innerData['sum'] = sum;
            stackedbarData.push(innerData);
            innerData = {};
            sum = 0;
        }
        return stackedbarData;
    }
    return "";
}


module.exports = {
    parse: parse
};
