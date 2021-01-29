/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateHeatmap from '../../charts/timedate_heatmap.js';
import CountUpChart from '../../charts/count_chart.js';
import ValueChart from '../../charts/value_chart.js';
import MultipleAreaChart from '../../charts/multipleArea_chart';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import { elasticsearchConnection } from '../../helpers/elasticsearchConnection';
var parseQueryStringData = require('../../parse_data/parseQueryStringData.js');
var parseDateHeatmap = require('../../parse_data/parseDateHeatmap.js');
var parseAggData = require('../../parse_data/parseAggData.js');
var parseAggSumBucketData = require('../../parse_data/parseAggSumBucketData.js');
var parseMultipleLineDataShareAxis = require('../../parse_data/parseMultipleLineDataShareAxis.js');
var parseMultipleLineDataShareAxisWithoutAgg = require('../../parse_data/parseMultipleLineDataShareAxisWithoutAgg.js');
var parseAggQueryWithoutScriptValue = require('../../parse_data/parseAggQueryWithoutScriptValue.js');

class HomeCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            sumCallAttempt: [],
            sumCallEnd: [],
            durationSum: [],
            answerSeizureRatio: [],
            callingCountries: [],
            avgDuration: [],
            typeDateHeatmap: [],
            parallelCalls: [],
            parallelRegs: [],
            callsActual: [],
            regsActuall: [],
            callsActualMinuteAgo: [],
            regsActualMinuteAgo: [],
            incidentActual: [],
            incidentActualMinuteAgo: [],
            incidentCount: [],
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

        this.setState({ isLoading: true });
        var data = await elasticsearchConnection("/home/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            console.log(typeof data === "string" && data.includes("ERROR:"));

            this.props.showError(data);
            this.setState({ isLoading: false });
            return;

        } else if (data) {
            //parse data
            //SUM CALL-END
            var sumCallEnd = parseQueryStringData.parse(data.responses[0]);

            //SUM CALL-ATTEMPT
            var sumCallAttempt = parseQueryStringData.parse(data.responses[1]);

            //DURATION SUM 
            var durationSum = parseAggData.parse(data.responses[3]);

            //ANSWER-SEIZURE RATIO
            var answerSeizureRatio = parseAggSumBucketData.parse(data.responses[4]);

            //AVG DURATION
            var avgDuration = parseAggData.parse(data.responses[5]);

            // DATE HEATMAP
            var typeDateHeatmap = parseDateHeatmap.parse(data.responses[6]);

            //PARALLEL CALLS
            var parallelCalls = parseMultipleLineDataShareAxis.parse("Calls", data.responses[7], "Calls-1d", data.responses[8]);

            //PARALLEL REGS
            var parallelRegs = parseMultipleLineDataShareAxis.parse("Regs", data.responses[9], "Regs-1d", data.responses[10]);

            //ACTUALL REGS
            var regsActual = parseAggQueryWithoutScriptValue.parse(data.responses[11]);

            //ACTUALL CALLS
            var callsActual = parseAggQueryWithoutScriptValue.parse(data.responses[12]);

            //INCIDENT COUNT
            var incidentCount = parseMultipleLineDataShareAxisWithoutAgg.parse("Incident", data.responses[13], "Incident-1d", data.responses[14]);

            //ACTUALL INCIDENT
            var incidentActual = parseQueryStringData.parse(data.responses[15]);

            //ACTUALL REGS MINUTE AGO
            var callsActualMinuteAgo = parseAggQueryWithoutScriptValue.parse(data.responses[16]);

            //ACTUALL CALLS MINUTE AGO
            var regsActualMinuteAgo = parseAggQueryWithoutScriptValue.parse(data.responses[17]);

            //ACTUALL INCIDENT MINUTE AGO
            var incidentActualMinuteAgo = parseQueryStringData.parse(data.responses[18]);

            console.info(new Date() + " MOKI HOME: finished parsíng data");

            this.setState({

                sumCallAttempt: sumCallAttempt,
                sumCallEnd: sumCallEnd,
                durationSum: durationSum,
                answerSeizureRatio: answerSeizureRatio,
                avgDuration: avgDuration,
                typeDateHeatmap: typeDateHeatmap,
                parallelCalls: parallelCalls,
                parallelRegs: parallelRegs,
                regsActual: regsActual,
                callsActual: callsActual,
                incidentCount: incidentCount,
                incidentActual: incidentActual,
                callsActualMinuteAgo: callsActualMinuteAgo,
                regsActualMinuteAgo: regsActualMinuteAgo,
                incidentActualMinuteAgo: incidentActualMinuteAgo,
                isLoading: false

            });


        }
    }

    //render GUI
    render() {
        return (
            <div>
                { this.state.isLoading && <LoadingScreenCharts />}
                <div className="row no-gutters">
                    <div className="col">
                        <ValueChart data={
                            this.state.sumCallEnd
                        } name={"# CALLS"} />
                    </div>
                    <div className="col">
                        <ValueChart data={
                            this.state.sumCallAttempt
                        } name={"# ATTEMPTS"} />
                    </div>
                    <div className="col">
                        <ValueChart data={
                            this.state.durationSum
                        } name={"SUM DURATION"} />
                    </div>
                    <div className="col">
                        <ValueChart data={
                            this.state.answerSeizureRatio
                        } name={"ASR (%)"} />
                    </div>
                    <div className="col">
                        <ValueChart data={
                            this.state.avgDuration
                        } name={"AVG DURATION"} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <TimedateHeatmap data={
                        this.state.typeDateHeatmap
                    } marginLeft={150} id="dateHeatmap" name={"TYPE DATE HEATMAP"} field={"attrs.type"} width={store.getState().width - 300} units={"count"} />
                </div>
                <div className="row no-gutters">
                    <div className="column">
                        <MultipleAreaChart data={
                            this.state.parallelCalls
                        } name={"PARALLEL CALLS"} id={"parallelCalls"} width={store.getState().width - 500} units={"count"} />
                    </div>
                    <div >
                        <CountUpChart data={
                            this.state.callsActual
                        } name={"ACTUAL CALLS"} biggerFont={"biggerFont"} dataAgo={this.state.callsActualMinuteAgo} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <div className="column">
                        <MultipleAreaChart data={
                            this.state.parallelRegs
                        } name={"PARALLEL REGS"} id={"parallelRegs"} width={store.getState().width - 500} units={"count"} />
                    </div>
                    <div >
                        <CountUpChart data={
                            this.state.regsActual
                        } name={"ACTUAL REGS"} biggerFont={"biggerFont"} dataAgo={this.state.regsActualMinuteAgo} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <div className="column">
                        <MultipleAreaChart data={
                            this.state.incidentCount
                        } name={"INCIDENTS"} units={"count"} id={"incidentCount"} width={store.getState().width - 500} />
                    </div>
                    <div>
                        <CountUpChart data={
                            this.state.incidentActual
                        } name={"INCIDENTS ACTUAL"} biggerFont={"biggerFont"} dataAgo={this.state.incidentActualMinuteAgo} />
                    </div>
                </div>
            </div>
        );
    }
}

export default HomeCharts;
