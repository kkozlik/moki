import React, {
    Component
} from 'react';
import * as d3 from "d3";
import {
    createFilter
} from '@moki-client/gui';
import ColorType from '../helpers/style/ColorType';
import Colors from '../helpers/style/Colors';
import Reds from '../helpers/style/ColorsReds';
import emptyIcon from "../../styles/icons/empty_small.png";
import storePersistent from "../store/indexPersistent";

export default class StackedChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
        this.draw = this.draw.bind(this);
        storePersistent.subscribe(() => this.draw(this.props.data, this.props.id, this.props.width, this.props.legendSize, this.props.field, this.props.height, this.props.units));
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
            this.draw(this.props.data, this.props.id, this.props.width, this.props.legendSize, this.props.field, this.props.height, this.props.units);
        }
    }


    draw(data, id, width, legendSize, field, height, units) {
        units = units ? " (" + units + ")" : "";
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById(id + "SVG");
        if (chart) {
            chart.remove();
        }

        var pie = d3.pie()
            .value(function (d) {
                return d.doc_count
            })
            .sort(null)
            .padAngle(.03);

        var w = width - legendSize;
        var h = height;
        var svgWidth = width;
        var legendRectSize = 15;
        var legendSpacing = 2;

        var radius = Math.min(w, h) / 2;
        var donutWidth = 75;
        var domain = 4;
        var color;

        var colorScale = d3.scaleOrdinal(Reds);
        var colorScaleMix = d3.scaleOrdinal(Colors);
        var profile = storePersistent.getState().profile;

        function color(nmb, i) {
            if (field === "attrs.rtp-MOScqex-avg") {
                if (nmb >= 4) {
                    return "#6b9235";
                } else if (nmb >= 3) {
                    return "#FF9800";
                } else if (nmb >= 2) {
                    return "#FF5607";
                } else {
                    return "#F6412D";
                }

            } else if (field === "attrs.type" && id !== "exceededType") {
                return ColorType[nmb];
            } else if (field === "encrypt") {
                
                var hmac = profile[0] ? profile[0].userprefs.validation_code : "";
                var mode = profile[0] ? profile[0].userprefs.mode : "";
                
                if (((mode === "encrypt" || mode === "anonymous") && nmb === hmac) || (nmb === "plain" && mode === "plain")) {
                    return "green";
                }
                else {
                    return colorScale(i);
                }
            }
            else {
                return colorScaleMix(nmb)
            }
        }

        var svg = d3.select('#' + id).append("svg");

        if (data.length === 0) {
            svg.attr('width', svgWidth)
                .attr('height', 100)
                .attr('id', id + 'SVG');

            svg.append("line")
                .attr("x1", 0)
                .attr("y1", 10)
                .attr("x2", svgWidth)
                .attr("y2", 10)
                .attr("stroke-width", 0.4)
                .attr("stroke", "#808080");

            svg.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + svgWidth / 2 + ',30)');

            svg.append("line")
                .attr("x1", 0)
                .attr("y1", 90)
                .attr("x2", svgWidth)
                .attr("y2", 90)
                .attr("stroke-width", 0.4)
                .attr("stroke", "#808080");

        } else {

            var g = svg.attr('width', svgWidth)
                .attr('height', h)
                .attr('id', id + 'SVG')
                .append('g')
                .attr('transform', 'translate(100,' + h / 2 + ')');

            var tooltip;

            var arc = d3.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius);

            var arcs = g.selectAll('path')
                .data(pie(data))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function (d, i) {
                    return color(d.data.key, i);
                })
                .style("cursor", "pointer")
                .on('mouseover', (d) => {

                    tooltip = d3.select('#' + id).append('div')
                        .style("width", "200px")
                        .style("height", "90px")
                        .style("background", "white")
                        .attr('class', 'tooltip tooltipDonut')
                        .style('opacity', 0.9)
                        .style("position", "absolute")
                        .style("box-shadow", "0px 0px 6px black")
                        .style("padding", "10px")
                        .html(`<span><strong>${d.data.key}</strong>: ${d3.format(',')(d.data.doc_count) + units}</span>`)
                        .style('left', `${d3.event.layerX - 10}px`)
                        .style('top', `${(d3.event.layerY - 130)}px`);
                })
                .on('mouseout', () =>
                    tooltip.remove()
                )

                .on("click", el => {
                    createFilter(field + ":\"" + el.data.key + "\"");
                    //bug fix: if you click but not move out
                    var tooltips = document.getElementsByClassName("tooltipDonut");
                    if (tooltip) {
                        for (var j = 0; j < tooltips.length; j++) {
                            tooltips[j].remove();
                        }
                    }
                });

            d3.arc()
                .outerRadius(radius * 0.9)
                .innerRadius(radius * 0.9);

            let angleInterpolation = d3.interpolate(pie.startAngle()(), pie.endAngle()());
            arcs.transition()
                .duration(1200)
                .attrTween("d", d => {
                    let originalEnd = d.endAngle;
                    return t => {
                        let currentAngle = angleInterpolation(t);
                        if (currentAngle < d.startAngle) {
                            return "";
                        }

                        d.endAngle = Math.min(currentAngle, originalEnd);

                        return arc(d);
                    };
                });


            //define legend
            var legend = g.selectAll('.legend')
                .data(data)
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function (d, i) {
                    var height = legendRectSize + legendSpacing;
                    var offset = height * domain / 2;
                    var horz = -2 * legendRectSize + 200;
                    var vert = i * height - offset - 50;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .attr('fill', function (d, i) {
                    return color(d.key, i);
                }).on("click", el => {
                    createFilter(field + ":\"" + el.key + "\"");
                    //bug fix: if you click but not move out
                    var tooltips = document.getElementsByClassName("tooltipDonut");
                    if (tooltip) {
                        for (var j = 0; j < tooltips.length; j++) {
                            tooltips[j].remove();
                        }
                    }
                });

            legend.append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function (d) {
                    for (var i = 0; i < pie(data).length; i++) {
                        return d.key + " (" + d.doc_count + ")";
                    }
                })
                .on("click", el => {
                    createFilter(field + ":\"" + el.key + "\"");
                    //bug fix: if you click but not move out
                    var tooltips = document.getElementsByClassName("tooltipDonut");
                    if (tooltip) {
                        for (var j = 0; j < tooltips.length; j++) {
                            tooltips[j].remove();
                        }
                    }
                });
        }
    }

    render() {
        return (<div id={this.props.id}>
            <h3 className="alignLeft title" > {
                this.props.name
            } </h3>
        </div>)
    }
}
