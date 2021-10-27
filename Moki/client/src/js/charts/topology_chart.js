import React, {
    Component
} from 'react';
import * as d3 from "d3";
import {Colors} from '@moki-client/gui';
import emptyIcon from "../../styles/icons/empty_small.png";
import Animation from '../helpers/Animation';

export default class topology extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data
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
            this.draw(this.state.data, this.props.width, this.props.height, this.props.units);
        }
    }


    setData(data) {
        this.setState({ data: data });
    }

    draw(data, width, height, units) {
        units = units ? " (" + units + ")" : "";
        //FOR UPDATE: remove chart if it's already there
        var chart = document.getElementById("topologyChartSVG");
        if (chart) {
            chart.remove();
        }



        var links = data ? data[2] : [];
        var nodes = data ? data[0] : [];
        var xScale = d3.scaleOrdinal(Colors);


        if (!data || data.length === 0 || links.length === 0 || nodes.length === 0) {
            var g = d3.select('#topologyChart')
                .append("svg")
                .attr('width', width)
                .attr('height', 300)
                .attr('id', 'topologyChartSVG');

            g.append('svg:image')
                .attr("xlink:href", emptyIcon)
                .attr('transform', 'translate(' + width / 2 + ',100)')

        } else {

            //get min a max value for nodes and links
            var minValueLink = links[0].value;
            var maxValueLink = 0;
            for (var i = 0; i < links.length; i++) {
                if (links[i].value > maxValueLink) {
                    maxValueLink = links[i].value;
                }

                if (links[i].value < minValueLink) {
                    minValueLink = links[i].value;
                }
            }

            var minValueNode = nodes[0].value;
            var maxValueNode = 0;

            for (i = 0; i < nodes.length; i++) {
                if (nodes[i].value > maxValueNode) {
                    maxValueNode = nodes[i].value;
                }

                if (nodes[i].value < minValueNode) {
                    minValueNode = nodes[i].value;
                }
            }

            var linkSizeScale = d3.scaleLog().domain([minValueLink, maxValueLink]).range([1, 5]);
            var nodeSizeScale = d3.scaleLog().domain([minValueNode, maxValueNode]).range([3, 10]);


            var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function (d) {
                    return d.id;
                }).distance(100).strength(2))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));

            // Create primary <g> element
            g = d3.select('#topologyChart')
                .append("svg")
                .attr('id', 'topologyChartSVG')
                .attr('width', width)
                .attr('height', height + 100);
            /* .append('g')
             .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');*/

            var tooltip;

            // build the arrow.
            //var scaleMarker = d3.scaleLinear().domain([minValueNode, maxValueNode]).range([10, 20]);

            g.append('defs').append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '-0 -5 10 10')
                .attr('refX', 14)
                .attr('refY', 0)
                .attr('markerUnits', 'strokeWidth')
                .attr('orient', 'auto')
                // .attr('markerWidth',   function(d) { return scaleMarker(d.value);})
                .attr('markerWidth', 5)
                .attr('markerHeight', 5)
                .attr('xoverflow', 'visible')
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', 'gray')
                .attr('stroke', 'gray');


            var link = g.selectAll('link')
                .data(links)
                .enter().append("path")
                .attr("stroke-width", function (d) {
                    return linkSizeScale(d.value);
                })
                .attr('class', 'link')
                .style('stroke', 'gray')
                .style('fill', 'none')
                .attr('marker-end', function (d) {
                    if (d.source === d.target) {
                        return '';
                    } else {
                        return 'url(#arrowhead)';
                    }

                });

            var node = g.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(nodes)
                .enter().append("g")

            node.append("circle")
                .attr("r", function (d) {
                    return nodeSizeScale(d.value)
                })
                .attr("fill", function (d) {
                    return xScale(d.value);
                })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .style("cursor", "pointer")
                .on('mouseover', (d) => {

                    tooltip = d3.select('#topologyChart').append('div')
                        .attr('class', 'tooltip tooltipTopology')
                        .style("width", "250px")
                        .style("height", "90px")
                        .style("background", "white")
                        .style("position", "absolute")
                        .style("box-shadow", "0px 0px 6px black")
                        .style("padding", "10px")
                        .style('opacity', 0.9)
                        .html(`<span><strong>${d.ip}</strong>: ${d.value + units}</span>`)
                        .style('left', `${d3.event.layerX - 10}px`)
                        .style('top', `${(d3.event.layerY - 100)}px`);

                })
                .on('mouseout', () => tooltip.remove());


            node.append("text")
                .text(function (d) {
                    return d.ip;
                })
                .attr('x', 17)
                .attr('y', 5);

            simulation
                .nodes(nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(links);

            function ticked() {
                for (let i = 0; i < 5; i++) {
                    simulation.tick();
                }
                link.attr("d", function (d) {
                    var x1 = d.source.x,
                        y1 = d.source.y,
                        x2 = d.target.x,
                        y2 = d.target.y,
                        dx = x2 - x1,
                        dy = y2 - y1,
                        dr = Math.sqrt(dx * dx + dy * dy),

                        // Defaults for normal edge.
                        drx = 0,
                        dry = 0,
                        xRotation = 0, // degrees
                        largeArc = 0, // 1 or 0
                        sweep = 0; // 1 or 0

                    // Self edge.
                    if (x1 === x2 && y1 === y2) {
                        // Fiddle with this angle to get loop oriented.
                        xRotation = -45;

                        // Needs to be 1.
                        largeArc = 1;

                        // Change sweep to change orientation of loop. 
                        //sweep = 0;

                        // Make drx and dry different to get an ellipse
                        // instead of a circle.
                        drx = 20;
                        dry = 10;

                        // For whatever reason the arc collapses to a point if the beginning
                        // and ending points of the arc are the same, so kludge it.
                        x2 = x2 + 1;
                        y2 = y2 + 1;
                    }

                    return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
                });


                node
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
            }

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.01).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
        }
        
    }

    render() {
        return (<div id="topologyChart" className="chart"> <h3 className="alignLeft title" > {
            this.props.name
        } </h3>
            {window.location.pathname !== "/connectivity" && <Animation name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} />}
        </div >)
    }
}
