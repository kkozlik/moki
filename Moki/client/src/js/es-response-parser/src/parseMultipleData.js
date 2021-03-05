/*
data: 
[ 
[name, value1, value2, value3],
[name2, value1, value2, value3],
]

*/
export default function parseMultipleData(response) {
    if (response && response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {
        var dataParse = response.aggregations.agg.buckets;
        var dataFinal = [];

        for (var j = 0; j < dataParse.length; j++) {
            dataFinal.push({
                name: dataParse[j].key,
                value0: dataParse[j].agg.value,
                value1: dataParse[j].agg2.value,
                value2: dataParse[j].agg3.value,
                value3: dataParse[j].agg4.value,
                value4: dataParse[j].agg6.value/100
            });
        }
        return dataFinal;
    }
    return "";
}


