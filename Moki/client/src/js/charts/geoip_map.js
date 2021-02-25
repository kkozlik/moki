import React, {
    Component
} from 'react';
import * as d3 from "d3";
import * as topojson from "topojson-client";
import map from "./world_map.json";
import {
    createFilter
} from '@moki-client/gui';
//import cities from "./world_cities.json";
//import cities from "./worldcities-limit500.csv";
import cities from "./cities_11.csv";
import emptyIcon from "../../styles/icons/empty.png";
import Animation from '../helpers/Animation';

export default class geoIpMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            svg: "",
            g: ""
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
        this.draw(this.state.data, this.props.width, this.props.units, this.props.name);
    }

    draw(data, width, units, name) {
        width = width < 0 ? 1028 : width;
        units = units ? " (" + units + ")" : "";
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById("geoIpMapSVGempty");
        if (chart) {
            chart.remove();
            var tooltips = document.getElementsByClassName("tooltipgeoIpMap");
            if (tooltips) {
                for (var j = 0; j < tooltips.length; j++) {
                    tooltips[j].remove();
                }
            }
        }
        // var margin = { top: 20, right: 10, bottom: 150, left: 60 };

        var height = 400;

        //var color= ["#61BEE2",  "#53B6DC", "#408CA9", "#30697F", "#3F555D"];
        // var  colorScale =d3.scaleLinear().range(["white", "blue"]);

        if (data.length === 0) {
            var svg = d3.select('#geoIpMap')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('id', 'geoIpMapSVGempty');
            svg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr("id", "emptyIconChart")
                .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        } else {

            var isEmpty = document.getElementsByClassName("city");
            //chart is empty /first run
            if (isEmpty.length === 0) {
                svg = d3.select('#geoIpMap')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);

                var g = svg.append("g").attr('transform', 'translate(' + width / 8 + ',0)');
                var projection = d3.geoMercator();
                var path = d3.geoPath().projection(projection);
                var rScale = d3.scaleSqrt();
                var first = true;

                //get max value
                var maxValue = 0;
                var minValue = data.length > 0 ? data[0].doc_count : 0;
                for (var i = 0; i < data.length; i++) {


                    if (maxValue < data[i].doc_count) {
                        maxValue = data[i].doc_count;
                    }
                    if (minValue > data[i].doc_count) {
                        minValue = data[i].doc_count;
                    }
                }

                rScale.domain([minValue - 1, maxValue + 1]).range([0, 8]);
                var thiss = this;
                // zoom and pan
                const zoom = d3.zoom()
                    .scaleExtent([1, 20])
                    .extent([[0, 0], [width, height]])
                    .on('zoom', () => {
                        g.style('stroke-width', `${1.5 / d3.event.transform.k}px`);
                        g.attr('transform', d3.event.transform);

                        // draw the circles in their new positions
                        /* d3.selectAll("circle").attr("r", d => d.doc_count ?
                             rScale(d.doc_count) / d3.event.transform.k : 2 / d3.event.transform.k
                         );
     */
                        d3.selectAll("circle").attr("r", function (d) {
                            if (d.doc_count) {
                                if (rScale(d.doc_count) / d3.event.transform.k > 2) {
                                    return 2;
                                }
                                else {
                                    return rScale(d.doc_count) / d3.event.transform.k;
                                }
                            } else {
                                return 2 / d3.event.transform.k;
                            }
                        })

                        //display names 
                        if (d3.event.transform.k >= 4 && first) {
                            first = false;
                            d3.csv(cities).then(function (city) {
                                g.selectAll(".city_label")
                                    .data(city)
                                    .enter()
                                    .append("text")
                                    .attr("class", "city_label")
                                    .text(function (d) {
                                        return d.city_ascii
                                    })
                                    .style("font-size", "2px")
                                    .attr("transform", function (d) {
                                        if (d.lng && d.lat) {
                                            return "translate(" + projection([
                                                d.lng,
                                                d.lat
                                            ]) + ")";
                                        }
                                    })
                            }
                            )
                        }
                        //zooming out
                        if (d3.event.transform.k < 4 && !first) {
                            first = true;
                            g.selectAll(".city_label").remove();
                        }

                    })
                svg.call(zoom);


                var countries = topojson.feature(map, map.objects.countries).features;
                g.selectAll("path")
                    .data(countries)
                    .enter().append("path")
                    .attr("d", path)
                    .attr("fill", "#343a40");

                var tooltip = d3.select('#geoIpMap').append('div')
                    .attr('class', 'tooltipgeoIpMap')
                    .style("width", "200px")
                    .style("height", "80px")
                    .style("background", "white")
                    .style('opacity', 0.9)
                    .style("position", "absolute")
                    .style("visibility", "hidden")
                    .style("box-shadow", "0px 0px 6px black")
                    .style("padding", "10px");
                tooltip.append("div");

                //cites
                d3.csv(cities).then(function (city) {


                    g.selectAll("city")
                        .data(city)
                        .enter()
                        .append("circle")
                        .attr("r", 2)
                        .attr("fill", "#121416")
                        .attr("class", "city")
                        .attr("transform", function (d) {
                            if (d.lng && d.lat) {
                                return "translate(" + projection([
                                    d.lng,
                                    d.lat
                                ]) + ")";
                            }
                        })
                        .on("mouseover", function (d) {
                            tooltip.style("visibility", "visible");
                            tooltip.select("div").html(d.city_ascii);
                        })
                        .on("mouseout", function (d) {
                            tooltip.style("visibility", "hidden")
                        })
                        .on("mousemove", function (d) {
                            tooltip
                                .style("left", (d3.event.layerX - 20) + "px")
                                .style("top", (d3.event.layerY - 70) + "px");

                        });
                    thiss.drawOnlyPins(g, name, data, units, svg)
                    thiss.setState({
                        g: g,
                        svg: svg
                    });
                });
            }
            //rerender only pins
            else {
                this.drawOnlyPins(this.state.g, name, data, units, this.state.svg)
            }
        }
    }


    //draw only data
    drawOnlyPins(g, name, data, units, svg) {
        var width = this.props.width;
        var height = 400;
        var projection = d3.geoMercator();

        var tooltip = d3.select('#geoIpMap').append('div')
            .attr('class', 'tooltipgeoIpMap')
            .style("width", "200px")
            .style("height", "80px")
            .style("background", "white")
            .style('opacity', 0.9)
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("box-shadow", "0px 0px 6px black")
            .style("padding", "10px");
        tooltip.append("div");

        var rScale = d3.scaleSqrt();

        //get max value
        var maxValue = 0;
        var minValue = data.length > 0 ? data[0].doc_count : 0;
        for (var i = 0; i < data.length; i++) {


            if (maxValue < data[i].doc_count) {
                maxValue = data[i].doc_count;
            }
            if (minValue > data[i].doc_count) {
                minValue = data[i].doc_count;
            }
        }

        rScale.domain([minValue - 1, maxValue + 1]).range([0, 8]);
        //remove old pins if exists
        var pins = document.getElementsByClassName("pins");
        if (pins.length > 0) {
            if (pins) {
                while (pins.length > 0) {
                    pins[0].parentNode.removeChild(pins[0]);
                }
            }

            var pinsPulse = document.getElementsByClassName("pinsPulse");
            if (pinsPulse) {
                while (pinsPulse.length > 0) {
                    pinsPulse[0].parentNode.removeChild(pinsPulse[0]);
                }
            }

            var color = name === "REGISTRATIONS MAP" ? "#caa547" : "#c41d03";
            pins = g.selectAll(".pin")
                .data(data)
                .enter().append("circle")
                .attr("r", function (d) {
                    if (rScale(d.doc_count) < 2) return 2;
                    return rScale(d.doc_count);
                })
                .attr("fill", "transparent")
                .attr("class", "pinsPulse")
                .style("stroke", color)
                .attr("transform", function (d) {
                    if (d.centroid && d.centroid.location && d.centroid.location.lon && d.centroid.location.lat) {
                        return "translate(" + projection([
                            d.centroid.location.lon,
                            d.centroid.location.lat
                        ]) + ")";
                    }
                    return "translate(-10,-10)";
                });

            g.selectAll(".pin")
                .data(data)
                .enter().append("circle")
                .attr("r", function (d) {
                    return rScale(d.doc_count) < 2 ? 2 : rScale(d.doc_count);
                })
                .attr("fill", color)
                .attr("class", "pins")
                .attr("transform", function (d) {
                    if (d.centroid && d.centroid.location && d.centroid.location.lon && d.centroid.location.lat) {
                        return "translate(" + projection([
                            d.centroid.location.lon,
                            d.centroid.location.lat
                        ]) + ")";
                    }
                    return "translate(-10,-10)";
                })
                .on("mouseover", function (d) {
                    tooltip.style("visibility", "visible");
                    d3.select(this).style("cursor", "pointer");
                    tooltip.select("div").html("<strong>City: </strong>" + d.key + " <br/><strong>Value: </strong>" + d3.format(',')(d.doc_count) + units);
                })
                .on("mouseout", function (d) {
                    tooltip.style("visibility", "hidden")
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.layerX - 20) + "px")
                        .style("top", (d3.event.layerY - 100) + "px");

                })
                .on("click", el => {
                    createFilter("geoip.city_name:" + el.key);

                    //bug fix: if you click but not move out
                    tooltip.style("visibility", "hidden")
                });

            function transition() {

                var i = 0;
                // Grow circles
                pins
                    .transition()
                    .ease(d3.easeLinear)
                    .attr("r", function (d) { if (d.doc_count) return rScale(d.doc_count) + 10 })
                    .style("opacity", function (d) { return d === 60 ? 0 : 1 })
                    .duration(500)
                    .on("end", function () { if (++i === pins.size() - 1) { transition(); } });


                // Reset circles where r == 0
                pins
                    .attr("r", 0)
                    .style("opacity", 1);

            }

            transition();

            // zoom and pan
            const zoom = d3.zoom()
                .scaleExtent([1, 20])
                .extent([[0, 0], [width, height]])
                .on('zoom', () => {
                    g.style('stroke-width', `${1.5 / d3.event.transform.k}px`);
                    g.attr('transform', d3.event.transform);

                    // draw the circles in their new positions
                    d3.selectAll("circle").attr("r", d => d.doc_count ?
                        rScale(d.doc_count) / d3.event.transform.k : 2 / d3.event.transform.k
                    );

                    //display names 
                    var first = true;
                    if (d3.event.transform.k >= 4 && first) {
                        first = false;
                        d3.csv(cities).then(function (city) {
                            g.selectAll(".city_label")
                                .data(city)
                                .enter()
                                .append("text")
                                .attr("class", "city_label")
                                .text(function (d) {
                                    return d.city_ascii
                                })
                                .style("font-size", "2px")
                                .attr("transform", function (d) {
                                    if (d.lng && d.lat) {
                                        return "translate(" + projection([
                                            d.lng,
                                            d.lat
                                        ]) + ")";
                                    }
                                })
                        }
                        )
                    }
                    //zooming out
                    if (d3.event.transform.k < 4 && !first) {
                        first = true;
                        g.selectAll(".city_label").remove();
                    }

                })
            svg.call(zoom);

        }
    }

    render() {
        return (<div id="geoIpMap" > <h3 className="alignLeft title" > {
            this.props.name
        } </h3><Animation display={this.props.displayAnimation} name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} autoplay={this.props.autoplay} /></div >)
    }
}
