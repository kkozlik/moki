import React, {
    Component
} from 'react';
import * as d3 from "d3";
import ColorType from '../helpers/style/ColorType';
import Colors from '../helpers/style/Colors';
import emptyIcon from "../../styles/icons/empty_small.png";
import Animation from '../helpers/Animation';

export default class barChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
        this.setData = this.setData.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data !== prevState.data) {
            return { data: nextProps.data };
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data !== this.props.data) {
            this.setState({ data: this.props.data });
            this.draw(this.props.data, this.props.width, this.props.units, this.props.name);
        }
    }

    setData(data) {
        this.setState({ data: data });
        this.draw(data, this.props.width, this.props.units, this.props.name);
    }


    draw(data, width, units, name) {
        units = units ? " (" + units + ")" : "";
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById("barChartSVG");
        if (chart) {
            chart.remove();
        }

        //compute max label length to get bottom margin
        var bottomMargin = 100;
        if (data && data.length > 0) {
            var maxTextWidth = d3.max(data.map(n => n.key.length));
            bottomMargin = maxTextWidth > 100 ? 100 : maxTextWidth * 13;
        }
        if (name === "TOTAL EVENTS IN INTERVAL") {
            bottomMargin = 100;
        }

        var margin = { top: 10, right: 20, bottom: bottomMargin, left: 60 };
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
                if (name === "QoS HISTOGRAM") {
                    if (d === "*-2.58") { return "Nearly all users dissatisfied"; }
                    if (d === "2.58-3.1") { return "Many users dissatisfied"; }
                    if (d === "3.1-3.6") { return "Some users dissatisfied"; }
                    if (d === "3.6-4.03") { return "Satisfied"; }
                    if (d === "4.03-*") { return "Very satisfied"; }
                }
                else {
                    return d;
                }
            });



        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

        var colorScale = d3.scaleOrdinal(Colors);

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

        var svg = d3.select('#barChart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('id', 'barChartSVG')
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.right})`);

        if (data !== undefined && data.length > 0 && !isEmpty) {
            if (name === "QoS HISTOGRAM") {
                xScale.domain(data.map(d => d.key));
            }
            else {
                xScale.domain(data.map(d => d.key));
            }
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
                while (word) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                    word  = words.pop();
                }
            });
        }



        if (data === undefined || data.length === 0 || isEmpty) {
            svg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

        }
        else {

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

            var tooltip = "";
            svg.selectAll('.bar').data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => xScale(d.key))
                .attr('width', xScale.bandwidth())
                .attr('y', d => yScale(d.doc_count))
                .style("fill", function (d) {
                    if (name === "QoS HISTOGRAM") {
                        if (d.key === "*-2.58") { return "#FE2E2E"; }
                        if (d.key === "2.58-3.1") { return "#F79F81"; }
                        if (d.key === "3.1-3.6") { return "#F3E2A9"; }
                        if (d.key === "3.6-4.03") { return "#95c196"; }
                        if (d.key === "4.03-*") { return "#4f9850"; }
                    }
                    else if (ColorType[d.key]) {
                        return ColorType[d.key];
                    }
                    else {
                        return colorScale(d.key);
                    }
                })
                .attr('height', d => height - yScale(d.doc_count))
                .on('mouseover', (d) => {
                    tooltip = d3.select('#barChart').append('div')
                        .attr('id', 'tooltip tooltipBar')
                        .attr("class", "tooltipCharts");

                    tooltip.style('opacity', 0.9);
                    tooltip.html(`<strong>Key: </strong>${d.key}<br/><strong>Value: </strong>${d.doc_count + units}`)
                        .style('left', `${d3.event.layerX}px`)
                        .style('top', `${d3.event.layerY}px`);

                    // d3.select(this).style("cursor", "pointer");
                })
                .on('mouseout', () => tooltip.style('visibility', "hidden"))
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.layerX + 180) + "px")
                        .style("top", (d3.event.layerY - 80) + "px");

                    if (d3.mouse(d3.event.target)[0] > window.innerWidth - 600) {
                        tooltip
                            .style("left", (d3.event.layerX - 350) + "px")
                    }
                });


            //animation for 2 sec, transition delay is in milliseconds, DISABLE BECAUSE OF PLAY MODE
            /* Add 'curtain' rectangle to hide entire graph */
            /*
            var curtain = svg.append('rect')
                .attr('x', -1 * width)
                .attr('y', -1 * height)
                .attr('height', height)
                .attr('width', width)
                .attr('class', 'curtain')
                .attr('transform', 'rotate(180)')
                .style('fill', '#ffffff');

            // Now transition the curtain to double of its width
            curtain.transition()
                .duration(1200)
                .ease(d3.easeLinear)
                .attr('x', -2 * width - 50);
                */

            // add the Y gridlines
            svg.append("g")
                .attr("class", "grid")
                .call(make_y_gridlines()
                    .tickSize(-width)
                    .tickFormat("")
                )

        }
    }

    render() {
        return (<div id="barChart" className="chart"><h3 className="alignLeft title">{this.props.name}</h3>
            {this.props.name === "QoS HISTOGRAM" && <Animation name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} />}</div>)
    }
}