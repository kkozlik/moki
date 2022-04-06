// various functions for chart drawing

import * as d3 from "d3";

/**
 * Function set tick valuse for horizontal time axis. The number of ticks
 * is set in dependency on graph width so the tick labels are not overlaped.
 *
 * @param {axis} axis
 */
export const setTickNrForTimeXAxis = (axis) => {
    // create invisible svg element and append it to DOM - without it
    // the getBoundingClientRect() function does not return valied data
    var container = document.createElement('div');
    var d3svg = d3.select(container)
        .style('position', 'absolute')
        .style('opacity', '0')
        .append('svg')
        .attr('width', 0)
        .attr('height', 0);

    document.body.append(container);

    // draw the axis
    d3svg.append("g")
        .attr("class", "x axis")
        .call(axis);

    var d3Axis = d3svg.select('g.axis path.domain');
    var axisWidth = d3Axis.node().getBoundingClientRect().width;

    // get all text elements of the axes
    var d3text = d3svg.selectAll('text');

    // get text width
    var ticksWidth = 0;
    d3text.nodes().forEach((node) => {
        if (node.getBoundingClientRect().width > ticksWidth) ticksWidth = node.getBoundingClientRect().width;
    });

    var tickPadding = 5;
    var ticks = Math.floor(axisWidth / (ticksWidth + 2 * tickPadding));

    // Cannot use axis.ticks() function to set number of ticks because this
    // function set the number of ticks just approximatelly.
    // So calculate tick values as the exact number dividing the range.
    var scale = axis.scale();
    var domainMin = scale.domain()[0];
    var range = scale.domain()[1] - scale.domain()[0];
    var step = range / ticks;
    var tickValues = [];

    for (var i=0; i < ticks+1; i++) tickValues.push(Math.round(domainMin + i*step));

    // set tick values for the axis
    axis.tickValues(tickValues);

    container.remove();
}
