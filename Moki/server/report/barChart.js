/*
Draw multiple area chart (for parallel calls, regs)
*/

function drawBarChart(data, id, width) {
    var bottomMargin = 150;

    var margin = {
        top: 10,
        right: 20,
        bottom: bottomMargin,
        left: 60
    };
    width = width - margin.left - margin.right;
    var height = 250 - margin.top - margin.bottom;
    var xScale = d3.scaleBand()
        .range([0, width])
        .round(true)
        .paddingInner(0.1); // space between bars (it's a ratio)

    var yScale = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = d3.axisBottom()
        .scale(xScale).tickFormat(function (d) {
            //tickValues

            if (d === "*-2.58") {
                return "Nearly all users dissatisfied";
            }
            if (d === "2.58-3.1") {
                return "Many users dissatisfied";
            }
            if (d === "3.1-3.6") {
                return "Some users dissatisfied";
            }
            if (d === "3.6-4.03") {
                return "Satisfied";
            }
            if (d === "4.03-*") {
                return "Very satisfied";
            }
        });



    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(5);


    if (data !== undefined) {
        //bug fix: check if data are empty if all doc_count === 0
        var isEmpty = true;
        for (var i = 0; i < data.length; i++) {
            if (data[i].doc_count > 0) {
                isEmpty = false;
                break;
            }
        }
    }

    var svg = d3.select('#' + id)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', id + "SVG")
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.right})`);

    if (data !== undefined && data.length > 0 && !isEmpty) {
        xScale.domain(data.map(d => d.key));
        yScale.domain([0, d3.max(data, d => d.doc_count)]);
    }

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .call(wrap, 80)
        .style("text-anchor", "end")
        .attr("dx", "-.6em")
        .attr("dy", ".10em")
        .attr("transform", function (d) {
            return "rotate(-65)"
        });

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Count');

    // gridlines in y axis function
    function make_y_gridlines() {
        return d3.axisLeft(yScale)
            .ticks(5)
    }

    svg.selectAll('.bar').data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.key))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d.doc_count))
        .style("fill", function (d) {
            if (d.key === "*-2.58") {
                return "#FE2E2E";
            }
            if (d.key === "2.58-3.1") {
                return "#F79F81";
            }
            if (d.key === "3.1-3.6") {
                return "#F3E2A9";
            }
            if (d.key === "3.6-4.03") {
                return "#95c196";
            }
            if (d.key === "4.03-*") {
                return "#4f9850";
            }
        })
        .attr('height', d => height - yScale(d.doc_count))

    // add the Y gridlines
    svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

}
