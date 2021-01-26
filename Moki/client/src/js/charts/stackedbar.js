import React, {
    Component
} from 'react';
import * as d3 from "d3";

import ColorType from '../helpers/ColorType';
import Colors from '../helpers/Colors';
import {
    createFilter
} from "../helpers/createFilter";
import emptyIcon from "../../styles/icons/empty_small.png";

/*
format:
{key: value, sum: xxx, name: yyy}
*/
export default class StackedChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
        this.draw = this.draw.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.state.data) {
            this.setState({ data: nextProps.data });
            this.draw(nextProps.data, this.props.id, this.props.width, this.props.name, this.props.units);
        }
    }

    draw(data, id, width, name, units) {
        units = units ? " (" + units + ")" : "";
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById(id + "SVG");
        if (chart) {
            chart.remove();
        }

        // Clean up lost tooltips
        var elements = document.getElementsByClassName('tooltip' + id);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
        var svg = d3.select('#' + id);
        var margin = {
            top: 13,
            right: 20,
            bottom: 50,
            left: 35
        };
        //window.innerWidth -200 
        width = width - margin.left - margin.right - 30;
        var height = 200 - margin.top - margin.bottom;

        var colorScale = d3.scaleOrdinal(Colors);


        var rootsvg = svg.append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('id', id + "SVG");
        //  .append('g');



        if (data !== undefined) {
            var max = d3.max(data, d => d.sum + 5);
            var domain = max ? max + max / 3 : 1;
        }
        var yScale = d3.scaleLinear().range([height, 0]).domain([0, domain]);
        var z = d3.scaleOrdinal().range(['#d53e4f', '#fc8d59', '#fee08b', '#ffffbf', '#e6f598', '#99d594', '#3288bd']);


        var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(function (d) {
            if (d / 1000000000000 >= 1) return d / 1000000000000 + " T";
            if (d / 1000000000 >= 1) return d / 1000000000 + " G";
            if (d / 1000000 >= 1) return d / 1000000 + " M";
            if (d / 1000 >= 1) return d / 1000 + " K";
            return d;
        });




        rootsvg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)").call(yAxis);

        rootsvg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        if (data === undefined || data.length === 0) {
            rootsvg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

        } else {

            var x = d3.scaleBand()
                .range([0, width])
                .paddingInner(0.1);
            x.domain(data.map(function (d) {
                return d.name;
            }));
            var xAxis = d3.axisBottom(x);

            rootsvg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(" + margin.left + "," + (height) + ")")
                .call(xAxis);

            var g = rootsvg.append("g")
                .attr("transform", "translate(" + margin.left + ",0)");

            /*  x.domain(data.map(function (d) {
                  return d.name;
              }));*/

            z.domain(data.map(function (d) {
                return d.keys;
            }));

            /*
            var keys = d3.keys(data[2]).filter(function (d) {
                if (d !== "time") {
                    if (d !== "value") {
                        if (d !== "sum") {
                            return d;
                        }
                    }
                }
                return "";

            });
*/
            var keys = this.props.keys;

            //var id = 0;
            var stack = d3.stack()
                //.keys(["Register new", "Registration expired", "Register del"])
                .keys(keys)
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            var layers = stack(data);

            var layer = g.selectAll(".layer")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .attr("type", function (d) {
                    return d.key;
                })
                .style("fill", function (d) {
                    if (name === "MoS STATS") {
                        if (d.key === "*-2.58") { return "#FE2E2E"; }
                        if (d.key === "2.58-3.1") { return "#F79F81"; }
                        if (d.key === "3.1-3.6") { return "#F3E2A9"; }
                        if (d.key === "3.6-4.03") { return "#95c196"; }
                        if (d.key === "4.03-*") { return "#4f9850"; }
                    }
                    else if (ColorType[d.key]) {
                        return ColorType[d.key];
                    } else {
                        return colorScale(d.key);
                    }
                })
                .on("mouseover", function (d) {
                    d3.select(this).style("stroke", "orange");
                })
                .on("mouseout", function (d) {
                    d3.select(this).style("stroke", "none");
                });

            // gridlines in y axis function
            function make_y_gridlines() {
                return d3.axisLeft(yScale)
                    .ticks(5)
            }


            layer.selectAll("rect")
                .data(function (d, i) {
                    return d;
                })
                .enter().append("rect")
                .attr('class', 'barStacked')
                .attr("x", function (d) {
                    return x(d.data.name);
                })
                .attr('width', function (d, i) {
                    return x.bandwidth();
                })
                .attr("y", function (d) {
                    return yScale(d[1]);
                })
                .attr("height", function (d) {
                    var height = yScale(d[0]) - yScale(d[1]);
                    if (height) {
                        return height
                    }
                    else {
                        return 0;
                    }
                })
                .on("mouseover", function (d, i) {
                    if (d3.mouse(d3.event.target)[0] > window.innerWidth - 600) {
                        tooltip.style.left = d3.mouse(d3.event.target)[1] - 200 + 'px';
                    }

                    tooltip.style("visibility", "visible");
                    tooltip.select("div").html("<strong>Type: </strong> " + this.parentNode.getAttribute("type") + "<br/><strong>Count:</strong> " + d3.format(',')(d[1] - d[0]) + units + "<br/>");
                    d3.select(this).style("cursor", "pointer");


                })
                .on("mouseout", function () {
                    //  d3.select(this).style("stroke","none");
                    tooltip.style("visibility", "hidden");
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.pageX - 200) + "px")
                        .style("top", (d3.event.pageY - 500) + "px");

                    if (d3.mouse(d3.event.target)[0] > window.innerWidth - 600) {
                        tooltip
                            .style("left", (d3.event.pageX - 500) + "px")
                    }
                });

            //filter type onClick
            layer.on("click", el => {
                createFilter("attrs.type:" + el.key);

                var tooltips = document.getElementsByClassName("tooltip" + id);
                if (tooltip) {
                    for (var j = 0; j < tooltips.length; j++) {
                        tooltips[j].style.opacity = 0;
                    }
                }
            });

            //animation for 2 sec, transition delay is in milliseconds
            /* Add 'curtain' rectangle to hide entire graph */
            var curtain = rootsvg.append('rect')
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

            /*
                        // add the X gridlines
                        g.append("g")
                            .attr("class", "grid")
                            .attr("transform", "translate(0," + height + ")")
                            .call(make_x_gridlines()
                                .tickSize(-height)
                                .tickFormat("")
                            )
            */
            // add the Y gridlines
            g.append("g")
                .attr("class", "grid")
                .call(make_y_gridlines()
                    .tickSize(-width)
                    .tickFormat("")
                )

            // tooltip
            var tooltip = d3.select('#' + id).append("div")
                .style("width", "200px")
                .style("height", "100px")
                .style("background", "white")
                .attr('class', 'tooltip' + id)
                .style("opacity", "0.9")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("box-shadow", "0px 0px 6px black")
                .style("padding", "10px");

            tooltip.append("div");


        }
    }

    render() {
        return (<div id={
            this.props.id
        } > <h3 className="alignLeft title" > {
            this.props.name
        } </h3></div >)
    }
}
