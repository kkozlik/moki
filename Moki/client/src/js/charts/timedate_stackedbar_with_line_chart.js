import React, {
    Component
} from 'react';
import * as d3 from "d3";

import ColorType from '../helpers/ColorType';
import Colors from '../helpers/Colors';
import { timestampBucket } from '../bars/TimestampBucket.js';
import store from "../store/index";
import { setTimerange } from "../actions/index";
import { createFilter } from "../helpers/createFilter";
import emptyIcon from "../../styles/icons/empty.png";

/*
format:

time
key
*/
export default class StackedChart extends Component {

    componentDidUpdate(prevProps) {
        this.draw(this.props.data, this.props.id, this.props.data2, this.props.width);
    }


    draw(data, id, data2, width) {
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
            top: 20,
            right: 60,
            bottom: 30,
            left: 35
        };
        var widthChart = width - margin.left - margin.right - 100;
        var height = 200 - margin.top - margin.bottom;

        var colorScale = d3.scaleOrdinal(Colors);
        var parseDate = d3.timeFormat(timestampBucket(store.getState().timerange[0], store.getState().timerange[1]));

        // var bucketSize = d3.timeFormat(timestampBucketSizeWidth(store.getState().timerange[0], store.getState().timerange[1])); 

        var rootsvg = svg.append("svg")
            .attr('width', width)
            .attr('height', height + margin.top + margin.bottom)
            .attr('id', id + "SVG");
        //  .append('g');

        //max and min date
        var maxTime = store.getState().timerange[1];
        var minTime = store.getState().timerange[0] - 7200;

        //scale for brush function
        var x = d3.scaleLinear()
            .range([0, widthChart])
            .domain([minTime, maxTime]);

        var rectWidth = 0;
        if (data[1]) {
            rectWidth = x(data[1].time) - x(data[0].time) - 2;

            console.log("šířka sloupečku: " + rectWidth);
            console.log(data[0].time);

            console.log(x(data[0].time));

        }


        var y = d3.scaleLinear().range([height, 0]);
        var z = d3.scaleOrdinal().range(['#d53e4f', '#fc8d59', '#fee08b', '#ffffbf', '#e6f598', '#99d594', '#3288bd']);

        var xAxis = d3.axisBottom()
            .scale(x)
            .ticks(7)
            .tickFormat(parseDate);

        var yAxis = d3.axisLeft(y).ticks(5).tickFormat(function (d) {
            return d
        });
        rootsvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + (height + 5) + ")")
            .call(xAxis);

        rootsvg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);

        if (data.length === 0) {
            rootsvg
                .append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + widthChart / 2 + ',' + height / 2 + ')')
        }
        else {
            rootsvg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");



            rootsvg.append("g")
                .attr("class", "brush")
                .call(d3.brushX()
                    .extent([[0, 0], [widthChart, height]])
                    .on("end", brushended));

            var g = rootsvg.append("g")
                .attr("transform", "translate(" + (margin.left) + ",0)");

            function brushended() {
                if (!d3.event.sourceEvent) return;
                // Only transition after input.
                if (!d3.event.selection) return;
                // Ignore empty selections.
                var extent = d3.event.selection;
                var timestamp_gte = Math.round(x.invert(extent[0]));
                var timestamp_lte = Math.round(x.invert(extent[1]));
                var timestamp_readiable = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " - " + new Date(Math.trunc(timestamp_lte)).toLocaleString()

                // timestamp_gte = Math.round(timestamp_gte/1000)*1000;
                //    timestamp_lte = Math.round(timestamp_lte/1000)*1000;
                store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));

            }

            y.domain([0, d3.max(data, function (d) {
                return d.sum + (d.sum / 3);
            })]);
            z.domain(data.map(function (d) {
                return d.keys;
            }));

            // gridlines in x axis function
            function make_x_gridlines() {
                return d3.axisBottom(x)
                    .ticks(7)
            }


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
                    if (ColorType[d.key]) {
                        return ColorType[d.key];
                    }
                    else {
                        return colorScale(d.key);
                    }
                })
                .on("mouseover", function (d) {
                    d3.select(this).style("stroke", "orange");
                })
                .on("mouseout", function (d) {
                    d3.select(this).style("stroke", "none");
                });


            layer.selectAll("rect")
                .data(function (d) {
                    return d;
                })
                .enter().append("rect")
                .attr('class', 'barStacked')
                .attr("x", function (d) {
                    //bug fix
                    if (x(d.data.time) < 0) {
                        return -1000;
                    }
                    return x(d.data.time);
                })
                //.attr("x", function(d) { return x(d.data.date); })
                .attr("y", function (d) {
                    return y(d[1]);
                })
                .attr("height", function (d) {
                    return y(d[0]) - y(d[1]);
                })
                //  .attr("width", bucketSize)
                .attr('width', (d, i) => data[i + 1] ? x(data[i + 1].time) - x(d.data.time) - 2 : 10)

                .on("mouseover", function (d, i) {
                    //d3.select(this).style("stroke","orange");

                    tooltip.style("visibility", "visible");
                    // .style("left", this.getAttribute("x") + 300 + "px")
                    //   .style("top", this.getAttribute("y") + 300 + "px");

                    tooltip.select("div").html("<strong>Time: </strong> " + parseDate(d.data.time) + "<br/><strong>Value:</strong> " + d3.format(',')(d[1] - d[0]) + "<br/><strong>Type: </strong>" + this.parentNode.getAttribute("type") + "<br/> ");
                    d3.select(this).style("cursor", "pointer");


                })
                .on("mouseout", function () {
                    //  d3.select(this).style("stroke","none");
                    tooltip.style("visibility", "hidden");
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.pageX - 200) + "px")
                        .style("top", (d3.event.pageY - 100) + "px");
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

            // Animation
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


            // add the X gridlines
            g.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(" + (-rectWidth) + "," + height + ")")
                .call(make_x_gridlines()
                    .tickSize(-height)
                    .tickFormat("")
                )


            //y axis label
            /*g.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0- margin.left)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Events count");   */

            // tooltip
            var tooltip = d3.select('#' + id).append("div")
                .style("width", "200px")
                .style("height", "90px")
                .style("background", "white")
                .attr('class', 'tooltip tooltip' + id)
                .style("opacity", "0.9")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("box-shadow", "0px 0px 6px black")
                .style("padding", "10px");

            tooltip.append("div");


            // Add the valueline path
            //scale for line
            var yLine = d3.scaleLinear().range([height, 0]);

            if (d3.max(data2, function (d) {
                return parseInt(d.agg.value + (d.agg.value / 3), 10);
            }) !== 0) {

                yLine.domain([0, d3.max(data2, function (d) {
                    return parseInt(d.agg.value + (d.agg.value / 3), 10);
                })]);

                // define the line
                var valueline = d3.line()
                    .x(function (d) { return x(d.key); })
                    .y(function (d) { return yLine(d.agg.value); });

                g.append("path")
                    .data([data2])
                    .attr("class", "lineBackground")
                    .attr("d", valueline);


                // Add the Yline Axis
                g.append("g")
                    .attr("class", "axisLine")
                    .attr("transform", "translate( " + widthChart + ", 0 )")
                    .call(d3.axisRight(yLine).ticks(5));



                //yLine axis label
                g.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", widthChart + 40)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text("Minutes");

                // Data dots
                g.selectAll(".dot")
                    .data(data2)
                    .enter().append("circle") // Uses the enter().append() method
                    .attr("class", "dot") // Assign a class for styling
                    .attr("cx", function (d, i) { return x(d.key) })
                    .attr("cy", function (d) { return yLine(d.agg.value) })
                    .attr("r", 3)
                    .on("mouseover", function (d, i) {
                        tooltip.style("visibility", "visible");
                        tooltip.select("div").html("<strong>Time: </strong> " + parseDate(d.key) + "<br/><strong>Duration:</strong> " + d3.format(',')(Math.round(d.agg.value)) + "<br/>");
                        d3.select(this).style("cursor", "pointer");
                    })
                    .on("mouseout", function () {
                        tooltip.style("visibility", "hidden");
                    })
                    .on("mousemove", function (d) {
                        tooltip
                            .style("left", (d3.event.pageX - 200) + "px")
                            .style("top", (d3.event.pageY - 100) + "px");
                    });



                /*      
                      
               // define legend box size and space
                  var legend_keys = ["duration"]
          
                  var lineLegend = g.selectAll(".lineLegend").data(legend_keys)
                      .enter().append("g")
                      .attr("class","lineLegend")
                      .attr("transform", function (d,i) {
                              return "translate(" + width + "," + (i*20)+")";
                          });
          
                  lineLegend.append("text").text(function (d) {return d;})
                      .attr("transform", "translate(15,9)"); //align texts with boxes
          
                  lineLegend.append("rect")
                      .attr("fill", "indigo")
                      .attr("width", 10).attr("height", 10);
                      */
            }
        }
    }

    render() {
        return (<div id={this.props.id}> <h3 className="alignLeft title">{this.props.name}</h3></div>)
    }
}
