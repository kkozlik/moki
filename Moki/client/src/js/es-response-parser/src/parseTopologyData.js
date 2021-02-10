/*
USE FOR:
topology chart:

 nodes {
      ip: 
      value: 
      id: 
      }

 - associate array
links{
    source: 
    target: 
    value: 
    }

*/
export default function parseTopologyData(response) {
    if (response && response.aggregations && response.aggregations.agg && response.aggregations.agg.buckets) {
        var dataParse = response.aggregations.agg.buckets;
        var nodes = [];
        var nodesList = [];
        var links = [];
        var id = 0;
        var nodeId = 0;

        for (var j = 0; j < dataParse.length; j++) {
            //if source already in nodeList
            if (nodesList.includes(dataParse[j].key)) {
                nodeId = nodesList.indexOf(dataParse[j].key);
                nodesList[nodeId].value = nodesList[nodeId].value + dataParse[j].doc_count;
            } else {
                nodesList.push(dataParse[j].key);
                nodeId = id++;
                nodes.push({
                    ip: dataParse[j].key,
                    value: dataParse[j].doc_count,
                    id: nodeId
                });

            }


            for (var i = 0; i < dataParse[j].agg.buckets.length; i++) {
                //if source already in nodeList
                if (nodesList.includes(dataParse[j].agg.buckets[i].key)) {
                    nodeId = nodesList.indexOf(dataParse[j].agg.buckets[i].key);
                    nodesList[nodeId].value = nodesList[nodeId].value + dataParse[j].agg.buckets[i].doc_count;
                } else {
                    nodesList.push(dataParse[j].agg.buckets[i].key);
                    nodeId = id++;
                    nodes.push({
                        ip: dataParse[j].agg.buckets[i].key,
                        value: dataParse[j].agg.buckets[i].doc_count,
                        id: nodeId
                    });
                }

                //create associate array for links
                links.push({
                    source: nodesList.indexOf(dataParse[j].key),
                    target: nodesList.indexOf(dataParse[j].agg.buckets[i].key),
                    value: dataParse[j].agg.buckets[i].doc_count
                });
            }
        }
        return [nodes, nodesList, links];
    }
    return "";
}


