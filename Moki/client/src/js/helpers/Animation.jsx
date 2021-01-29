/*
Class for chart animation. Get special format with time data from ES, parse it and display it in animation.
Play, pause and stop function. 
30s long animation
*/
import React, {
    Component
} from 'react';
import store from "../store/index";
import playIcon from "../../styles/icons/play.png";
import pauseIcon from "../../styles/icons/stop.png";
import historyIcon from "../../styles/icons/reload_time_grey.png";
import {
    elasticsearchConnection
} from '../helpers/elasticsearchConnection';
import { setTimerange } from "../actions/index";
var parseDateHeatmapAnimation = require('../parse_data/parseDateHeatmapAnimation.js');
var parseDateHeatmapDocCountAnimation = require('../parse_data/parseDateHeatmapDocCountAnimation.js');
var parseTwoAggAnimation = require('../parse_data/parseTwoAggAnimation.js');
var parseGeoipAnimation = require('../parse_data/parseGeoipAnimation.js');
var parseTopologyDataAnimation = require('../parse_data/parseTopologyDataAnimation.js');
var parseHistogramDataAnimation = require('../parse_data/parseHistogramDataAnimation.js');
var parseListDataAnimation = require('../parse_data/parseListDataAnimation.js');
var parseQueryStringDataAnimation = require('../parse_data/parseQueryStringDataAnimation.js');
var parseDistinctDataAnimation = require('../parse_data/parseDistinctDataAnimation.js');

class Animation extends Component {
    // Initialize the state
    constructor(props) {
        super(props);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.loadData = this.loadData.bind(this);
        this.changeSliderInput = this.changeSliderInput.bind(this);
        this.hideAnimation = this.hideAnimation.bind(this);
        this.loadTimerange = this.loadTimerange.bind(this);
        this.state = {
            data: [],
            animationTime: "",
            count: -1,
            icon: playIcon,
            dataAll: "",
            animation: ""
        }
        store.subscribe(() => this.hideAnimation());
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataAll !== this.state.dataAll && (this.state.dataAll === "" || this.state.dataAll === undefined)) {
            this.setState({ dataAll: nextProps.dataAll });
        }
    }

    componentDidMount() {
        //if autoplay active, run first animation
        if (this.props.autoplay) {
            document.getElementById(this.props.name).click();
        }
    }

    /*
    if timerange is changed hide animation
    */
    hideAnimation() {
        this.setState({
            data: [],
            animationTime: "",
            count: -1
        });

    }
    /*
        get data with timestamps
    */
    async loadData() {
        //first run load data, else just play animation
        if (this.state.count === -1) {
            //replace space for underscore and lower case
            var name = this.props.name.replace(/ /g, "_").toLowerCase();
            var dashboard = window.location.pathname.substring(1);
            //get format is "dashboardName/chartName"
            var data = await elasticsearchConnection(dashboard + "/" + name);
            if (typeof data === "string" && data.includes("ERROR:")) {
                alert("Problem with getting data: " + data);
                return;
            } else if (data) {
                //get the right data format and parse it
                if (this.props.type === "4agg") {
                    data = parseDateHeatmapAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "2agg") {
                    data = parseTwoAggAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "geoip") {
                    data = parseGeoipAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "4aggdoc") {
                    data = parseDateHeatmapDocCountAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "topology") {
                    data = parseTopologyDataAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "histogram") {
                    data = parseHistogramDataAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "list") {
                    data = parseListDataAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "countUP") {
                    data = parseQueryStringDataAnimation.parse(data.responses[0]);
                }
                else if (this.props.type === "distinct") {
                    data = parseDistinctDataAnimation.parse(data.responses[0]);
                }
                else {
                    alert("Problem with parsing data.");
                }
                this.setState({
                    data: data
                });
                this.play();
            }
        }
        else { this.play(); }
    }

    /*
    play animation
    */
    play() {
        var data = this.state.data;
        //pause
        if (this.state.icon === pauseIcon && this.state.count !== -1) {
            this.pause();
        }
        else {
            //play
            if (data) {
                this.setState({
                    icon: pauseIcon
                })
                var i = this.state.count;
                var thiss = this;
                console.info("Animation: starting");
                var animation = setInterval(function () {
                    i++;
                    if (data && data[i] && data[i].data) {
                        thiss.setState({
                            animationTime: data[i].time,
                            count: i
                        })
                        thiss.props.setData(data[i].data);
                    }
                    else {
                        console.info("Animation: finish, ending");
                        clearInterval(animation);
                        thiss.props.setData(thiss.state.dataAll);
                        thiss.setState({
                            data: [],
                            animationTime: "",
                            count: -1,
                            icon: playIcon,
                            animation: "",
                            dataAll: ""
                        })

                    }
                }, 1000);

                this.setState({
                    animation: animation
                })
            }
            else {
                clearInterval(animation);
                console.info("Animation: no data, ending");
                this.setState({
                    data: [],
                    animationTime: "",
                    count: -1,
                    icon: playIcon,
                    animation: ""
                })
                this.props.setData(this.state.dataAll);
            }
        }
    }

    pause() {
        clearInterval(this.state.animation);
        this.setState({ icon: playIcon });
    }

    //load selected timerange by animation
    loadTimerange() {
        var interval = (store.getState().timerange[1] - store.getState().timerange[0]) / 30;
        var timestamp_readiable = new Date(this.state.animationTime).toLocaleString() + " - " + new Date(this.state.animationTime + interval).toLocaleString();
        store.dispatch(setTimerange([this.state.animationTime, this.state.animationTime + interval, timestamp_readiable]))
    }

    //user changes input
    changeSliderInput(event) {
        //pause if something is running
        this.pause();
        if (this.state.data[event.target.value] && this.state.data[event.target.value].time) {
            this.setState({
                animationTime: this.state.data[event.target.value].time,
                count: event.target.value
            });
            if(event.target.value >= this.state.data.length-1){
                this.props.setData(this.state.dataAll);
            }
            else {
                this.props.setData(this.state.data[event.target.value].data);
            }
        }
    }

    //render animation buttons and slider
    render() {
        //special case if refresh is active, delete animation
        if (this.state.data.length === 0 && this.state.animation) {
            clearInterval(this.state.animation);
            this.setState({
                animation: "",
                animationTime: "",
                count: -1,
                icon: playIcon,
                dataAll: ""
            });
        }
        var display = this.props.display === "none" ? "none" : "block";
        var interval = (store.getState().timerange[1] - store.getState().timerange[0]) / 30000;
        interval = interval / 60 > 1 ? Math.round(interval / 60) + "min" : interval + "s";
        return (<div style={{ "display": display }}>
            <span onClick={this.loadData} id={this.props.name}>
                <img style={{ "marginLeft": "10px", "marginRight": "0px" }} className="iconRefresh" alt="playIcon" src={this.state.icon} title="play" />
            </span>
            { this.state.animationTime ? <span onClick={this.loadTimerange}>
                <img style={{ "marginLeft": "10px", "marginRight": "0px" }} className="iconRefresh" alt="loadIcon" src={historyIcon} title="load selected time" />
            </span> : ""
            }
            { this.state.animationTime ? <span className="slidecontainer">
                <input type="range" min="0" max={this.state.data.length - 1} onInput={this.changeSliderInput} value={this.state.count} className="slider" id="animationRange">
                </input>{new Date(this.state.animationTime).toLocaleString() + " + " + interval}</span> : ""
            }
        </div>
        );
    }
}

export default Animation;
