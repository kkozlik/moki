/*
data: 

name: name,
values: time, value

*/
function parse(responseName, response, responseName2, response2) {
    if (response.aggregations && response2.aggregations && response.aggregations.agg && response2.aggregations.agg) {
        var areachartDataParse = response.aggregations.agg.buckets;
        var areachartDataParse2 = response2.aggregations.agg.buckets;
        var areachartDataValue = [];
        var areachartDataFinal = [];

        //old data in background
        for (var j = 0; j < areachartDataParse2.length; j++) {
            if (areachartDataParse2[j].agg.value !== null) {
                areachartDataValue.push({
                    date: areachartDataParse2[j].key + 60 * 60 * 24 * 1000,
                    value: areachartDataParse2[j].agg.value,
                });
            }
        }
        areachartDataFinal.push({
            name: responseName2,
            values: areachartDataValue

        });

        areachartDataValue = [];
        for (j = 0; j < areachartDataParse.length; j++) {
            if (areachartDataParse[j].agg.value !== null) {
                areachartDataValue.push({
                    date: areachartDataParse[j].key,
                    value: areachartDataParse[j].agg.value,
                });
            }
        }
        areachartDataFinal.push({
            name: responseName,
            values: areachartDataValue

        })

        return areachartDataFinal;
    } else {
        return "";
    }
}

module.exports = {
    parse: parse
};
