/*
data:

name: name,
values: timestamp, value1

*/

import React, {
    Component
} from 'react';
import * as d3 from "d3";
import {
    createFilter
} from '@moki-client/gui';
import {
    timestampBucket
} from '../bars/TimestampBucket.js';
import store from "../store/index";
import {
    setTimerange
} from "../actions/index";
import {Colors} from '@moki-client/gui';
import emptyIcon from "../../styles/icons/empty_small.png";
import {
    getTimeBucketInt, getTimeBucket
} from "../helpers/getTimeBucket";
import { parseTimestamp } from "../helpers/parseTimestamp";
import {setTickNrForTimeXAxis} from "../helpers/chart";

const CUMULATIVE_SUM = ["CALL STARTS BY HOST", "TX BYTES BY HOST", "RX PACKET BY HOST", "TX PACKET BY HOST", "RX BYTES BY INTERFACE", "TX BYTES BY INTERFACE", "RX PACKETS BY INTERFACE", "TX PACKETS BY INTERFACE"];

export default class MultipleLineChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
        this.draw = this.draw.bind(this);
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
            this.draw(this.props.data, this.props.id, this.props.ticks, this.props.hostnames);
        }
    }


    drawLegend(svg, data, field, hostnames, color){

        var legendGroup = svg.append('g');
        var legend = legendGroup.selectAll('.legend')
            .data(data)
            .enter().append('g')
            .attr('class', 'legend');

        legend.append('rect')
            .attr('x', function (d, i) {
                if (i < 7) return 0;
            })
            .attr('y', function (d, i) {
                if (i < 7) return i * 17;
            })
            .attr('width', function (d, i) {
                if (i < 7) return 10;
            })
            .attr('height', function (d, i) {
                if (i < 7) return 10;
            })
            .style('fill', function (d, i) {
                if (i < 7) {
                    return hostnames && hostnames[d.name] ? hostnames[d.name] : color(i);
                }
            })
            .on("click", el => {
                createFilter(field + ":\"" + el.name + "\"");
            });

        legend.append('text')
            .attr('x', 20)
            .attr('y', function (d, i) {
                if (i < 7) return (i * 17) + 5;
            })
            .text(function (d, i) {
                if (i < 7) return d.name;
            })
            .on("click", el => {
                createFilter(field + ":\"" + el.name + "\"");
            });

        return legendGroup;
    }

    draw(data, id, ticks, hostnames) {
        var field = this.props.field ? this.props.field : "attrs.hostname";

        //make div values if necessary
        if (window.location.pathname === "/stats" || CUMULATIVE_SUM.includes(this.props.name)) {
            var divData = [];
            for (var k = 0; k < data.length; k++) {
                divData.push({
                    name: data[k].name,
                    values: []
                })
                for (var l = 0; l < data[k].values.length-1; l++) {
                    if(data[k].values[l + 1].value === null || data[k].values[l].value === null){
                        divData[k].values.push({
                            date: data[k].values[l].date,
                            value: null
                        });
                    }
                    else {
                        let val = data[k].values[l + 1].value - data[k].values[l].value;
                        divData[k].values.push({
                            date: data[k].values[l].date,
                            value: val < 0 ? 0 : val
                        });
                    }
                }
            }
            data = divData;
        }

        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById(id + "SVG");
        if (chart) {
            chart.remove();
        }

        //max and min date
        var maxTime = store.getState().timerange[1] + getTimeBucketInt();
        var minTime = store.getState().timerange[0];

        // Clean up lost tooltips
        var elements = document.getElementById('tooltip' + id);
        if (elements) {
            elements.parentNode.removeChild(elements);
        }
        var margin = {
            top: 20,
            right: 20,
            bottom: 40,
            left: 70
        };

        var height = 100;
        var duration = 250;

        var lineOpacity = "0.45";
        var lineOpacityHover = "0.85";
        var otherlinesOpacityHover = "0.1";
        var lineStroke = "2.5px";
        var lineStrokeHover = "2.5px";

        var circleOpacity = '0.85';
        var circleOpacityOnlineHover = "0.25"
        var circleRadius = 3;
        var circleRadiusHover = 6;
        var parseDate = d3.timeFormat(timestampBucket(store.getState().timerange[0], store.getState().timerange[1]));

        var svg = d3.select('#' + id)
            .append("svg")
            .attr('width', '100%')
            .attr('height', height + margin.top + margin.bottom)
            .attr('id', id + "SVG")
            .append('g');

        var color = d3.scaleOrdinal().range(Colors);

        var svgWidth = d3.select('#' + id).node().clientWidth;

        var legendWidth = 110;
        var legendSpacer = 10;
        var legendPadding = 5;

        if (data.length > 0) {
            // create legend and get it's width
            var legend = this.drawLegend(svg, data, field, hostnames, color);
            legendWidth = legend.node().getBBox().width + legendPadding;
        }

        var width = svgWidth - (margin.left + margin.right + legendSpacer + legendWidth);
        if (width < 100) width = 100;

        var xScale = d3.scaleLinear()
            .range([0, width])
            .domain([minTime, maxTime]);

        //if idle, do minus 100 for all values
        if (id.includes("Idle")) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].values.length; j++) {
                    data[i].values[j].value = 100 - data[i].values[j].value;
                }
            }
        }

        //max value
        var max = 0;
        for ( i = 0; i < data.length; i++) {
            for ( k = 0; k < data[i].values.length; k++) {
                if (data[i].values[k].hasOwnProperty("value")) {
                    if (max < data[i].values[k].value) {
                        max = data[i].values[k].value;
                    }
                }
            }
        }


        var domain = max === 0 ? 1 : max + max / 3;
        var yScale = d3.scaleLinear()
            .domain([0, domain])
            .range([height, 0]);

        var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(ticks)
            .tickFormat(parseDate);

        setTickNrForTimeXAxis(xAxis);

        var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(function (d) {
            if (d / 1000000000000 >= 1) return d / 1000000000000 + " T";
            if (d / 1000000000 >= 1) return d / 1000000000 + " G";
            if (d / 1000000 >= 1) return d / 1000000 + " M";
            if (d / 1000 >= 1) return d / 1000 + " K";
            return d;
        });

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(yScale)
                .ticks(5)
        }

        svg.attr("transform", "translate(" + margin.left + "," + margin.right + ")");

        if (data.length === 0) {
            svg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + (width / 3 + 20) + ',' + height / 4 + ')')

        } else {
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append('text')
                .attr("y", 15)
                .attr("transform", "rotate(-90)")
                .attr("fill", "#000");


            svg.append("g")
                .attr("class", "brush")
                .call(d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("end", brushended));

            function brushended() {
                if (!d3.event.sourceEvent) return;
                // Only transition after input.
                if (!d3.event.selection) return;
                // Ignore empty selections.
                var extent = d3.event.selection;
                var timestamp_gte = xScale.invert(extent[0]);
                var timestamp_lte = xScale.invert(extent[1]);
                var timestamp_readiable = parseTimestamp(new Date(Math.trunc(timestamp_gte))) + " - " + parseTimestamp(new Date(Math.trunc(timestamp_lte)));
                store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));

            }

            // add the Y gridlines
            svg.append("g")
                .attr("class", "grid")
                .transition()
                .duration(1200)
                .call(make_y_gridlines()
                    .tickSize(-width)
                    .tickFormat("")
                )

            /* Add line into SVG */
            var line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.value));

            let lines = svg.append('g')
                .attr('class', 'lines')
                .attr('transform', 'translate(5,0)');

            lines.selectAll('.line-group')
                .data(data).enter()
                .append('g')
                .attr('class', 'line-group')
                .append('path')
                .attr('class', 'line')
                .attr('d', d => d.values ? line(d.values) : 0)
                .style('stroke', (d, i) => hostnames && hostnames[d.name] ? hostnames[d.name] : color(i))
                .style('opacity', lineOpacity)
                .on("mouseover", function (d) {
                    d3.selectAll('.line')
                        .style('opacity', otherlinesOpacityHover);
                    d3.selectAll('.circle' + id)
                        .style('opacity', circleOpacityOnlineHover);
                    d3.select(this)
                        .style('opacity', lineOpacityHover)
                        .style("stroke-width", lineStrokeHover)
                        .style("cursor", "pointer");
                })
                .on("mouseout", function (d) {
                    d3.selectAll(".line")
                        .style('opacity', lineOpacity);
                    d3.selectAll('.circle' + id)
                        .style('opacity', circleOpacity);
                    d3.select(this)
                        .style("stroke-width", lineStroke)
                        .style("cursor", "none");
                });

            var tooltip = d3.select('#' + id).append('div')
                .attr('id', 'tooltip ' + id)
                .attr("class", "tooltipCharts");

            tooltip.append("div");

            /* Add circles in the line */
            lines.selectAll("circle-group" + id)
                .data(data).enter()
                .append("g")
                .style("fill", (d, i) => hostnames && hostnames[d.name] ? hostnames[d.name] : color(i))
                .selectAll("circle" + id)
                .data(d => d.values).enter()
                .append("g")
                .attr("class", "circle" + id)
                .style("cursor", "pointer")
                .on("mouseover", function (d) {
                    tooltip.style("visibility", "visible");
                    tooltip.select("div").html("<strong>Time: </strong>" + parseTimestamp(d.date) + " + " + getTimeBucket() + "<strong><br/>Value: </strong>" + d3.format(',')(d.value) + "<br/> ");

                    var tooltipDim = tooltip.node().getBoundingClientRect();
                    var chartRect = d3.select('#' + id).node().getBoundingClientRect();
                    tooltip
                        .style("left", (d3.event.clientX - chartRect.left + document.body.scrollLeft - (tooltipDim.width / 2)) + "px")
                        .style("top", (d3.event.clientY - chartRect.top + document.body.scrollTop + 15) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.style("visibility", "hidden")
                })
                .on("mousemove", function (d) {
                    var tooltipDim = tooltip.node().getBoundingClientRect();
                    var chartRect = d3.select('#' + id).node().getBoundingClientRect();
                    tooltip
                        .style("left", (d3.event.clientX - chartRect.left + document.body.scrollLeft - (tooltipDim.width / 2)) + "px")
                        .style("top", (d3.event.clientY - chartRect.top + document.body.scrollTop + 15) + "px");
                })
                .append("circle")
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yScale(d.value))
                .attr("r", circleRadius)
                .style('opacity', circleOpacity)
                .on("mouseover", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(duration)
                        .attr("r", circleRadiusHover);
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .transition()
                        .duration(duration)
                        .attr("r", circleRadius);
                });

            //animation

            /* Add 'curtain' rectangle to hide entire graph */
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

            legend.raise();
            legend.attr('transform', 'translate(' + (svgWidth - legendWidth - margin.left - margin.right + legendSpacer) + ',0)');
        }
    }

    render() {
        var bucket = getTimeBucket();
        return (<div id={
            this.props.id
        } className="chart">
            <h3 className="alignLeft title" style={{ "float": "inherit" }}> {
                this.props.name
            } <span className="smallText"> (interval: {bucket})</span></h3></div>)
    }
}
