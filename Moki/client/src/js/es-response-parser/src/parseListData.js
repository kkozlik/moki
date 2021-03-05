import { decrypt} from "../../intuitive/decrypt";

export default function parseListData(response, isDecrypt = false){
    if (response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets && response.aggregations.nested) {
        var data = response.aggregations.agg.buckets;
        if (isDecrypt === true) {
            for (var i = 0; i < data.length; i++) {
                data[i].key = decrypt(data[i].key);
            }
        }
        return [response.aggregations.agg.buckets, response.aggregations.nested.value];
    }
    return ["", ""];
}
