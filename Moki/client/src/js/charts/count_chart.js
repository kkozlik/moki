import React, {
    Component
} from 'react';
import Animation from '../helpers/Animation';
import {
    getTimeBucket
} from "../helpers/getTimeBucket";

export default class CountUpChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            data: [],
            dataAgo: 0
        }
        this.countUp = this.countUp.bind(this);
        this.setData = this.setData.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState(nextProps);
            this.countUp(nextProps.data);
            this.getDifference(nextProps.data, nextProps.dataAgo);
        }
    }

    setData(data) {
        if (data) {
            this.setState({
                data: data,
                count: data
            });
        }
    }

    getNumberLength(number) {
        return number.toString().length;
    }

    countUp(data) {
        if (data > 0) {
            var end = data;
            var current = 0;
            //too long duration - got stuck
            // var duration = 120;
            //var increment = end <= duration ? Math.abs(Math.floor(duration / end)) : Math.abs(Math.floor(end / duration));
            var increment = Math.abs(Math.floor(data / 10)) === 0 ? 1 : Math.abs(Math.floor(data / 10));
            var thiss = this;

            var timer = setInterval(function () {
                current += increment;
                thiss.setState({ count: current });

                if (current + increment >= end) {
                    thiss.setState({ count: end });
                    clearInterval(timer);
                }
            }, 1);
        }
        else {
            this.setState({
                count: 0,
                data: 0
            });
        }
    }

    getDifference(value, valueAgo) {
        var diff = value - valueAgo;
        this.setState({ valueAgo: diff })
    }

    //display="none"
    render() {
        var digits = this.getNumberLength(this.state.count);
        var style ="";

        if(digits > 8){
            style ="count-chart-counter-xs";
        }
        else if(digits > 5){
            style ="count-chart-counter-sm";
        }
        var bucket = getTimeBucket();
        return (
            <div id={this.props.name} className={ (window.location.pathname === "/home" || window.location.pathname === "/") ? "chart valuechartHeight" : "chart valuechart" } >
                {window.location.pathname === "/web" && <Animation name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} autoplay={this.props.autoplay} display={this.props.displayAnimation} />}
                <h3 className="alignLeft title" style={{ "float": "inherit" }}>{this.props.name}</h3>
                <h4 className={"alignLeft count-chart-counter " + style} title={"last " + bucket} >{this.state.count ? this.state.count.toLocaleString() : 0}</h4>
                {!Number.isNaN(this.state.valueAgo) && <h4 className={"alignLeft "} title={"difference to previous"}><span style={{ "color": this.state.valueAgo === 0 ? "black" : this.state.valueAgo > 0 ? "green" : "red" }}>{this.state.valueAgo > 0 ? "(+" + this.state.valueAgo + ")" : "(" + this.state.valueAgo + ")"}</span></h4>}
            </div>
        )
    }
}
