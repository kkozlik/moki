/*
Draw multiple area chart (for parallel calls, regs)
*/

function drawMultipleAreaChart(data, id, width) {

    function niceNumber(nmb, name) {
        if (name && nmb && name.includes("DURATION")) {
            var sec_num = parseInt(nmb, 10);

            var days = Math.floor(sec_num / 86400) ? Math.floor(sec_num / 86400) + "d" : "";

            var hours = Math.floor(sec_num / 3600) ? Math.floor(sec_num / 3600) + "h" : "";

            var minutes = Math.floor((sec_num % 3600) / 60) ? Math.floor((sec_num % 3600) / 60) + "m" : "";

            var seconds = sec_num % 60 ? sec_num % 60 + "s" : "";

            //don't  display seconds if value is in days
            if (days) {
                seconds = "";
            }

            if (!days && !hours && !minutes && !seconds) return "0s";
            return days + " " + hours + " " + minutes + " " + seconds;
        } else if (nmb) {
            return nmb.toLocaleString();
        } else {
            return 0;
        }
    }

    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 70
    };
    width = width - margin.left - margin.right;
    var height = 200 - margin.top - margin.bottom;
    var duration = 250;

    var Colors = ["#caa547", "#30427F", "#697F30", "#ca8b47", "#0a3f53", "#4d8296", "#58a959", "#A5CA47", "#5b67a4", "#121e5b", "#efcc76", "#3c488a", "#844a0b", "#efb576"];
    var areaOpacity = "0.45";
    var areaOpacityHover = "0.85";
    var otherareasOpacityHover = "0.1";
    var areaStroke = "2.5px";
    var areaStrokeHover = "2.5px";

    var circleOpacity = '0.85';
    var circleOpacityOnareaHover = "0.25"
    var circleRadius = 3;
    var circleRadiusHover = 6;

    var parseDate = d3.timeFormat("%d %b %H:%M %p");


    var svg = d3.select('#' + id)
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', id + "SVG")
        .append('g');

    var color = d3.scaleOrdinal().range(Colors);

    if (id === "parallel_calls") {
        color = d3.scaleOrdinal().range(["#caa547", "#30427F"]);
    } else if (id === "parallel_regs") {
        color = d3.scaleOrdinal().range(["#caa547", "#A5CA47"]);
    } else if (id === "incidents") {
        color = d3.scaleOrdinal().range(["#caa547", "#69307F"]);
    }

    // gridlines in y axis function
    function make_y_gridlines() {
        return d3.axisLeft(yScale)
            .ticks(5)
    }
    // document.getElementById("body").innerHTML =JSON.stringify(svg)+"aa";  
    //max and min date
    var maxTime = 0;
    var minTime = 0;
    if (data[0].values.length > 0) {
        maxTime = data[0].values[0].date;
        minTime = data[0].values[0].date;

        for (var i = 0; i < data.length; i++) {
            for (var k = 0; k < data[i].values.length; k++) {
                if (data[i].values[k].hasOwnProperty("date")) {
                    if (maxTime < data[i].values[k].date) {
                        maxTime = data[i].values[k].date;
                    }
                }
                if (data[i].values[k].hasOwnProperty("date")) {
                    if (minTime > data[i].values[k].date) {
                        minTime = data[i].values[k].date;
                    }
                }
            }
        }
    }


    //document.getElementById("body").innerHTML =maxTime+"aa"; 
    var xScale = d3.scaleLinear()
        .range([0, width])
        .domain([minTime, maxTime]);


    if (data.length >= 1) {
        //max value    
        var max = 0;
        var min = 0;
        if (data[1].values.length > 0) {

            min = data[1].values[0].value;
        } else if (data[0].values.length > 0) {

            min = data[0].values[0].value;
        }



        for (i = 0; i < data.length; i++) {
            for (k = 0; k < data[i].values.length; k++) {
                if (data[i].values[k].hasOwnProperty("value")) {
                    if (max < data[i].values[k].value) {
                        max = data[i].values[k].value;
                    }
                    if (min > data[i].values[k].value) {
                        min = data[i].values[k].value;
                    }
                }
            }
        }
    }
    var domain = max + max / 3;
    // var yScale = d3.scaleLinear();
    var yScale = d3.scaleLinear()
        .domain([0, domain])
        .range([height, 0]);


    //get minimum y axis only for parallel registration 
    if (id === "parallel_regs") {
        domain = max === 0 ? domain = 1 : domain = max + (max - min);

        yScale.domain([min, domain])
            .range([height, 0]);
    } else {
        domain = max === 0 ? domain = 1 : domain = max + max / 3;

        yScale.domain([0, domain])
            .range([height, 0]);
    }



    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(5)
        .tickFormat(parseDate);

    var yAxis = d3.axisLeft(yScale).ticks(5);


    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append('text')
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);


    svg.attr("transform", "translate(" + margin.left + "," + margin.right + ")");

    var area = d3.area()
        .x(d => xScale(d.date))
        .y1(d => yScale(d.value))
        .y0(height);

    let areas = svg.append('g')
        .attr('class', 'areas');


    // add the Y gridlines
    areas.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    areas.selectAll('.area-group')
        .data(data).enter()
        .append('g')
        .attr('class', 'area-group')
        .append('path')
        .attr('class', 'area')
        .attr('d', d => area(d.values))
        .style('stroke', (d, i) => color(i))
        .style('fill', (d, i) => color(i))
        .style('opacity', areaOpacity)


    areas.selectAll("circle-group" + id)
        .data(data).enter()
        .append("g")
        .style("fill", (d, i) => color(i))
        .selectAll("circle" + id)
        .data(d => d.values).enter()
        .append("g")
        .attr("class", "circle" + id)
        .style("cursor", "pointer")
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity);




    var legend = svg.selectAll('.legend')
        .data(data)
        .enter().append('g')
        .attr('class', 'legend');


    legend.append('rect')
        .attr('x', width - 80)
        .attr('y', function (d, i) {
            return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d, i) {
            return color(i);
        });

    legend.append('text')
        .attr('x', width - 60)
        .attr('y', function (d, i) {
            return (i * 20) + 9;
        })
        .text(function (d) {
            return d.name;
        });

}
