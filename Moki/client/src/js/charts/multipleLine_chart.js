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
    timestampBucket
} from '../bars/TimestampBucket.js';
import store from "../store/index";
import {
    setTimerange
} from "../actions/index";
import Colors from '../helpers/style/Colors';
import emptyIcon from "../../styles/icons/empty_small.png";
import {
    getTimeBucketInt, getTimeBucket
} from "../helpers/getTimeBucket";

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
            this.draw(this.props.data, this.props.id, this.props.width, this.props.ticks, this.props.hostnames);
        }
    }


    draw(data, id, width, ticks, hostnames) {
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById(id + "SVG");
        if (chart) {
            chart.remove();
        }

        //max and min date
        var maxTime = store.getState().timerange[1] + getTimeBucketInt();
        var minTime = store.getState().timerange[0];

        // Clean up lost tooltips
        var elements = document.getElementsByClassName('tooltip' + id);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
        var margin = {
            top: 20,
            right: 20,
            bottom: 40,
            left: 70
        };

        var legendWidth = 110;
        if (data.length > 0) {
            var maxTextWidth = d3.max(data.map(n => n.name.length));
            legendWidth = maxTextWidth > 100 ? 100 : maxTextWidth * 13;
        }

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
            .attr('width', width + margin.left + margin.right + legendWidth)
            .attr('height', height + margin.top + margin.bottom)
            .attr('id', id + "SVG")
            .append('g');

        var color = d3.scaleOrdinal().range(Colors);

        var xScale = d3.scaleLinear()
            .range([0, width])
            .domain([minTime, maxTime]);

        //max value    
        var max = 0;
        for (var i = 0; i < data.length; i++) {
            for (var k = 0; k < data[i].values.length; k++) {
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


        svg.attr("transform", "translate(" + margin.left + "," + margin.right + ")");

        if (data.length === 0 || (data[0].values.length === 0 && data[1].values.length === 0)) {
            svg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + (width / 3 + 20) + ',' + height / 4 + ')')

        } else {



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
                var timestamp = timestamp_gte + " - " + timestamp_lte;
                store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp]));

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
                .style('stroke', (d, i) => hostnames[d.name] ? hostnames[d.name] : color(i))
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
                .attr('class', 'tooltip tooltip' + id)
                .style("width", "200px")
                .style("height", "90px")
                .style("background", "white")
                .style('opacity', 0.9)
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("box-shadow", "0px 0px 6px black")
                .style("padding", "10px");
            tooltip.append("div");

            /* Add circles in the line */
            lines.selectAll("circle-group" + id)
                .data(data).enter()
                .append("g")
                .style("fill", (d, i) => hostnames[d.name] ? hostnames[d.name] : color(i))
                .selectAll("circle" + id)
                .data(d => d.values).enter()
                .append("g")
                .attr("class", "circle" + id)
                .style("cursor", "pointer")
                .on("mouseover", function (d) {
                    tooltip.style("visibility", "visible");
                    tooltip.select("div").html("<strong>Time: </strong>" + parseDate(d.date) + " + "+getTimeBucket()+"<strong><br/>Value: </strong>" + d3.format(',')(d.value) + "<br/> ");
                })
                .on("mouseout", function (d) {
                    tooltip.style("visibility", "hidden")
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.layerX - 20) + "px")
                        .style("top", (d3.event.layerY - 100) + "px");

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


            var translateLegend = (width / 5) + 20;
            var legend = svg.selectAll('.legend')
                .data(data)
                .enter().append('g')
                .attr('transform', 'translate(' + translateLegend + ',0)')
                .attr('class', 'legend');
            legend.append('rect')
                .attr('x', function (d, i) {
                    if (i < 7) {
                        return width - 80;
                    }
                })
                .attr('y', function (d, i) {
                    if (i < 7) {
                        return i * 17;
                    }
                })
                .attr('width', function (d, i) {
                    if (i < 7) {
                        return 10;
                    }
                })
                .attr('height', function (d, i) {
                    if (i < 7) {
                        return 10;
                    }
                })
                .style('fill', function (d, i) {
                    if (i < 7) {
                        return hostnames[d.name] ? hostnames[d.name] : color(i);
                    }
                });

            legend.append('text')
                .attr('x', width - 60)
                .attr('y', function (d, i) {
                    if (i < 7) {
                        return (i * 17) + 5;
                    }
                })
                .text(function (d, i) {
                    if (i < 7) {
                        return d.name;
                    }
                });


        }
    }

    render() {
        var bucket = getTimeBucket();
        return (<div id={
            this.props.id
        }>
            <h3 className="alignLeft title" > {
                this.props.name
            } <span className="smallText"> (interval: {bucket})</span></h3></div>)
    }
}
