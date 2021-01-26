   function drawListChart(data, id) {
        function niceNumber(nmb){
            if(nmb){
                return nmb.toLocaleString();
            }else {
                return 0;
            }
        }

       console.log(data);
       console.log(id);
 var chart = document.getElementById(id);
       
        for (var i = 0; i < data[0].length; i++) { 
            var row = document.createElement("tr");        
            var cell = document.createElement("td");
            var cellText = document.createTextNode(niceNumber(data[0][i].key));
            
            cell.appendChild(cellText);
            row.appendChild(cell);
            
            cell = document.createElement("td");
            cell.className="filtertd";
            cellText = document.createTextNode(niceNumber(data[0][i].doc_count));
            
            cell.appendChild(cellText);
            row.appendChild(cell);
            

                
            chart.appendChild(row);
            

              }


    }
