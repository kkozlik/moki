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
            dataAgo: []
        }
        this.countUp = this.countUp.bind(this);
        this.setData = this.setData.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState(nextProps);
            this.countUp(nextProps.data);
        }
    }

    setData(data) {
        this.setState({
            data: data,
            count: data
        });
    }

    countUp(data) {
        if (data > 0) {
            var end = data;
            var current = 0;
            var duration = 120;
            var increment = end <= duration ? Math.abs(Math.floor(duration / end)) : Math.abs(Math.floor(end / duration));
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
    }

    getDifference(value, valueAgo) {
        if (valueAgo) {
            var diff = value - valueAgo;

            if (diff === 0) {
                return <span >{"(" + diff + ")"}</span>;
            }
            else if (diff > 0) {
                return <span style={{ "color": "green" }}>{"(+" + diff + ")"}</span>;
            }
            else return <span style={{ "color": "red" }}>{"(" + diff + ")"}</span>;
        } else {
            return "";
        }
    }

    //display="none"
    render() {
        var bucket = getTimeBucket();
        return (
            <div id="valueChart">
                {window.location.pathname === "/web" && <Animation name={this.props.name} type={this.props.type} setData={this.setData} dataAll={this.state.data} autoplay={this.props.autoplay} display={this.props.displayAnimation} />}
                <h3 className="alignLeft title" >{this.props.name}</h3>
                <h4 className={"alignLeft " + this.props.biggerFont} title={"last " + bucket}>{this.state.count.toLocaleString()}</h4>
                <h4 className={"alignLeft "} title={"difference to previous"}>{this.getDifference(this.state.data, this.state.dataAgo)}</h4>
            </div>
        )
    }
}
