   function drawMultipleChart(data) {
        function niceNumber(nmb){
            if(nmb){
                return nmb.toLocaleString();
            }else {
                return 0;
            }
        }

       data = data.aggregations.agg.buckets;
       var chart = document.getElementById("multivalueChart");
       
        for (var i = 0; i < data.length; i++) { 
            var row = document.createElement("tr");        
            var cell = document.createElement("td");
            var cellText = document.createTextNode(niceNumber(data[i].key));
            
            cell.appendChild(cellText);
            row.appendChild(cell);
            
            cell = document.createElement("td");
            cell.className="rowM";
            cellText = document.createTextNode(niceNumber(data[i].agg.value));
            
            cell.appendChild(cellText);
            row.appendChild(cell);
            
             cell = document.createElement("td");
            cell.className="rowM";
            cellText = document.createTextNode(niceNumber(data[i].agg2.value));
            
            cell.appendChild(cellText);
            row.appendChild(cell);
            
             cell = document.createElement("td");
            cell.className="rowM";
            cellText = document.createTextNode(niceNumber(data[i].agg3.value));
            
            cell.appendChild(cellText);
            row.appendChild(cell);
            
             cell = document.createElement("td");
            cell.className="rowM";
            cellText = document.createTextNode(niceNumber(data[i].agg4.value));
            
            cell.appendChild(cellText);
            row.appendChild(cell);

                
            chart.appendChild(row);

              }

    }
