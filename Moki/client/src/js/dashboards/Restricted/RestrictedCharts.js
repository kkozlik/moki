/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import ListChart from '../../charts/list_chart.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import DashboardsTypes from '../../helpers/DashboardsTypes';
//import StackedLineChart from '../../charts/timedate_stackedbar_with_line_chart.js';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
var parseQueryStringData = require('../../parse_data/parseQueryStringData.js');
var parseAggData = require('../../parse_data/parseAggData.js');
var parseAggSumBucketData = require('../../parse_data/parseAggSumBucketData.js');
var parseBucketData = require('../../parse_data/parseBucketData.js');
var parseListData = require('../../parse_data/parseListData.js');
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');


class RestrictedCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            sumCallAttempt: [],
            sumCallEnd: [],
            durationSum: [],
            answerSeizureRatio: [],
            avgDuration: [],
            sumDurationOverTime: [],
            fromUA: [],
            sourceIP: [],
            eventCallsTimeline: [],
            eventExceededTimeline: [],
            top10to: [],
            callingCountries: [],
            avgMoS: [],
            QoSHistogram: [],
            sipcodeCount: [],
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
    get filters, types and timerange from GUI
    */
    async loadData() {

        this.setState({
            isLoading: true
        });
        var data = await elasticsearchConnection("restricted/home");

        if (typeof data === "string" && data.includes("ERROR:")) {

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {
            //parse data
            //SUM CALL-END
            var sumCallEnd = parseQueryStringData.parse(data.responses[0]);

            //SUM CALL-ATTEMPT
            var sumCallAttempt = parseQueryStringData.parse(data.responses[1]);

            //CALLING COUNTRIES
            var callingCountries = parseListData.parse(data.responses[2]);

            //DURATION SUM 
            var durationSum = parseAggData.parse(data.responses[3]);

            //ANSWER-SEIZURE RATIO
            var answerSeizureRatio = parseAggSumBucketData.parse(data.responses[4]);

            //AVG DURATION
            var avgDuration = parseAggData.parse(data.responses[5]);

            //SUM DURATION OVER TIME
            var sumDurationOverTime = parseBucketData.parse(data.responses[6]);

            //FROM UA
            var fromUA = parseListData.parse(data.responses[7]);

            //SOURCE IP ADDRESS
            var sourceIP = parseListData.parse(data.responses[8]);

            //EVENT CALLS TIMELINE
            var eventCallsTimeline = parseStackedTimebar.parse(data.responses[9]);

            //EVENT EXCEEDED TIMELINE
            var eventExceededTimeline = parseStackedTimebar.parse(data.responses[10]);

            //TOP 10 TO
            var top10to = parseListData.parse(data.responses[11]);

            //AVG MoS
            var avgMoS = parseAggData.parse(data.responses[12]);

            console.info(new Date() + " MOKI HOME: finished parsíng data");

            this.setState({

                sumCallAttempt: sumCallAttempt,
                sumCallEnd: sumCallEnd,
                durationSum: durationSum,
                answerSeizureRatio: answerSeizureRatio,
                avgDuration: avgDuration,
                sumDurationOverTime: sumDurationOverTime,
                fromUA: fromUA,
                sourceIP: sourceIP,
                eventCallsTimeline: eventCallsTimeline,
                eventExceededTimeline: eventExceededTimeline,
                top10to: top10to,
                callingCountries: callingCountries,
                avgMoS: avgMoS,
                isLoading: false
            });


        }
    }

    //render GUI
    render() {
        return (<div> {
            this.state.isLoading && < LoadingScreenCharts left="0" />
        } <div className="row no-gutters" >
                <div className="col" >
                    <ValueChart data={
                        this.state.sumCallEnd
                    }
                        name={
                            "# CALLS"
                        }
                        fontSize={
                            "1.5rem"
                        }
                    />  </div> <div className="col" >
                    <ValueChart data={
                        this.state.sumCallAttempt
                    }
                        name={
                            "# ATTEMPTS"
                        }
                        fontSize={
                            "1.5rem"
                        }
                    />  </div> <div className="col" >
                    <ValueChart data={
                        this.state.durationSum
                    }
                        name={
                            "SUM DURATION"
                        }
                        fontSize={
                            "1.5rem"
                        }
                    />  </div>  <div className="col" >
                    <ValueChart data={
                        this.state.answerSeizureRatio
                    }
                        name={
                            "ASR (%)"
                        }
                        fontSize={
                            "1.5rem"
                        }
                    />  </div> <div className="col" >
                    <ValueChart data={
                        this.state.avgDuration
                    }
                        name={
                            "AVG LEN (min)"
                        }
                        fontSize={
                            "1.5rem"
                        }
                    />  </div> <div className="col" >
                    <ValueChart data={
                        this.state.avgMoS
                    }
                        name={
                            "AVG MoS"
                        }
                    />  </div>  </div> <div className="row no-gutters" >
                <TimedateStackedChart id="eventsOverTimeCalls"
                    data={
                        this.state.eventCallsTimeline
                    }
                    name={
                        "EVENTS OVER TIME"
                    }
                    keys={
                        DashboardsTypes["index"]
                    }
                    width={
                        store.getState().width - 300
                    }

                />  </div> <div className="row no-gutters" >

                <TimedateStackedChart id="eventExceededTimeline"
                    data={
                        this.state.eventExceededTimeline
                    }
                    name={
                        "INCIDENTS OVER TIME"
                    }
                    keys={
                        DashboardsTypes["exceeded"]
                    }
                    width={
                        store.getState().width - 300
                    }
                />  </div>

            <div className="row no-gutters" >
                <div className="col-5 col-md-4" >
                    <ListChart data={
                        this.state.sourceIP
                    }
                        name={
                            "SOURCE IP ADDRESS"
                        }
                        field={
                            "attrs.source"
                        }
                    />  </div> <div className="col" >
                    <ListChart data={
                        this.state.callingCountries
                    }
                        name={
                            "COUNTRIES"
                        }
                        field={
                            "geoip.country_code2"
                        }
                    />  </div> <div className="col-5 col-md-4" >
                    <ListChart data={
                        this.state.top10to
                    }
                        name={
                            "TOP 10 TO"
                        }
                        field={
                            "attrs.to.keyword"
                        }
                    />  </div>  <div className="col-5 col-md-4" >
                    <ListChart data={
                        this.state.fromUA
                    }
                        name={
                            "FROM UA"
                        }
                        field={
                            "attrs.from-ua"
                        }
                    />   </div>
            </div>
        </div>
        );
    }
}

export default RestrictedCharts;
