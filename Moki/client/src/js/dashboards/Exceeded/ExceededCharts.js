/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import DonutChart from '../../charts/donut_chart.js';
import ListChart from '../../charts/list_chart.js';
import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
import DashboardsTypes from '../../helpers/DashboardsTypes';
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');
var parseBucketData = require('../../parse_data/parseBucketData.js');
var parseQueryStringData = require('../../parse_data/parseQueryStringData.js');
var parseListData = require('../../parse_data/parseListData.js');

class ExceededCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            eventCallsTimeline: [],
            exceededCount: [],
            exceededType: [],
            topOffenders: [],
            subnets: [],
            ipAddress: [],
            isLoading: true

        }
        store.subscribe(() => this.loadData());

    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    componentDidMount() {
        this.loadData();
    }

    /*
    Load data from elasticsearch
    get filters, types and timerange
    */
    async loadData() {
        this.setState({
            isLoading: true
        });
        var data = await elasticsearchConnection("exceeded/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //parse data
            //EVENT CALLS TIMELINE
            var eventCallsTimeline = parseStackedTimebar.parse(data.responses[0]);
            console.info(new Date() + " MOKI CALLS: finished parsíng data");

            //EXCEEDED COUNT
            var exceededCount = parseQueryStringData.parse(data.responses[1]);

            //EXCEEDED TYPE
            var exceededType = parseBucketData.parse(data.responses[2]);

            //TOP OFFENDERS
            var topOffenders = parseListData.parse(data.responses[3]);

            //EVENTS BY IP ADDR 
            var ipAddress = parseListData.parse(data.responses[4]);

            //TOP SUBNETS /24 EXCEEDED
            var subnets = parseListData.parse(data.responses[5]);

            this.setState({
                eventCallsTimeline: eventCallsTimeline,
                exceededCount: exceededCount,
                exceededType: exceededType,
                topOffenders: topOffenders,
                subnets: subnets,
                ipAddress: ipAddress,
                isLoading: false
            });
        }
    }


    //render GUI
    render() {
        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            } <
            div className="row no-gutters" >
                <
                    div className="col" >
                    <
                        TimedateStackedChart id="eventsOverTime"
                        data={
                            this.state.eventCallsTimeline
                        }
                        units={"count"}
                        name={
                            "EVENTS OVER TIME"
                        }
                        keys={
                            DashboardsTypes["exceeded"]
                        }
                        width={
                            store.getState().width - 300
                        }
                    />  <
            /div>

            <div className="col" >
                        <ValueChart data={
                            this.state.exceededCount
                        }
                            name={
                                "INCIDENTS COUNT"
                            }
                            biggerFont={
                                "biggerFont"
                            }
                        />  </div>
                    <div className="col" >
                        <
                            DonutChart data={
                                this.state.exceededType
                            }
                            units={"count"}
                            name={
                                "EXCEEDED TYPE"
                            }
                            id="exceededType"
                            width={
                                (store.getState().width - 300) / 2
                            }
                            height={
                                170
                            }
                            legendSize={
                                50
                            }
                            field="exceeded" />
                    </div>
                </div> <
            div className="row no-gutters" >
                    <
            div className="col" >
                        <
                            ListChart data={
                                this.state.topOffenders
                            }
                            name={
                                "TOP OFFENDERS"
                            }
                            field={
                                "attrs.from.keyword"
                            }
                        />  <
            /div>
                <div className="col" >
                            <
                                ListChart data={
                                    this.state.subnets
                                }
                                name={
                                    "TOP SUBNETS /24 EXCEEDED"
                                }
                                field={
                                    "attrs.sourceSubnets"
                                }
                            />  <
            /div>
            <
                                div className="col" >
                                <
                                    ListChart data={
                                        this.state.ipAddress
                                    }
                                    name={
                                        "EXCEEDED EVENTS BY IP ADDR"
                                    }
                                    field={
                                        "attrs.source"
                                    }
                                />  <
            /div>
                </div> </div>
        );
    }
}

export default ExceededCharts;
