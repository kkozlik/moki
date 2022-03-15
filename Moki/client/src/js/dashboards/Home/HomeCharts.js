/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';
import Dashboard from '../Dashboard.js';
import TimedateHeatmap from '../../charts/timedate_heatmap.js';
import CountUpChart from '../../charts/count_chart.js';
import ValueChart from '../../charts/value_chart.js';
import MultipleAreaChart from '../../charts/multipleArea_chart';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import { parseQueryStringData, parseDateHeatmap, parseAggData, parseAggSumBucketData, parseMultipleLineDataShareAxis, parseMultipleLineDataShareAxisWithoutAgg, parseAggQuerySumValue } from '@moki-client/es-response-parser';

class HomeCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            dashboardName: "home/charts",
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

        this.callBacks = {
            functors: [
                //SUM CALL-END 0
                [{ result: 'sumCallEnd', func: parseQueryStringData }],
                //SUM CALL-ATTEMPT 1
                [{ result: 'sumCallAttempt', func: parseQueryStringData }],
                [],
                ////DURATION SUM  3
                [{ result: 'durationSum', func: parseAggData }],
                //ANSWER-SEIZURE RATIO 4
                [{ result: 'answerSeizureRatio', func: parseAggSumBucketData }],
                //AVG DURATION 5
                [{ result: 'avgDuration', func: parseAggData }],
                //DATE HEATMAP 6
                [{ result: 'typeDateHeatmap', func: parseDateHeatmap, attrs: ["attrs.type", "attrs.type"] }],
                //PARALLEL CALLS 7+8
                [{ result: 'parallelCalls', func: parseMultipleLineDataShareAxis, type: "multipleLineData", details: ["Calls", "Calls-1d"] }],
                [],
                //PARALLEL REGS 9+10
                [{ result: 'parallelRegs', func: parseMultipleLineDataShareAxis, type: "multipleLineData", details: ["Regs", "Regs-1d"] }],
                [],
                //ACTUALL REGS 11
                [{ result: 'regsActual', func: parseAggQuerySumValue }],
                //ACTUALL CALLS 12
                [{ result: 'callsActual', func: parseAggQuerySumValue }],
                //PARALLEL INCIDENT 13+14
                [{ result: 'incidentCount', func: parseMultipleLineDataShareAxisWithoutAgg, type: "multipleLineData", details: ["Incident", "Incident-1d"] }],
                [],
                //ACTUALL INCIDENT 15
                [{ result: 'incidentActual', func: parseQueryStringData }],
                //ACTUALL REGS MINUTE AGO 16
                [{ result: 'callsActualMinuteAgo', func: parseAggQuerySumValue }],
                //ACTUALL CALLS MINUTE AGO 17
                [{ result: 'regsActualMinuteAgo', func: parseAggQuerySumValue }],
                //ACTUALL INCIDENT MINUTE AGO 18
                [{ result: 'incidentActualMinuteAgo', func: parseQueryStringData }],
            ]
        }
    }


    render() {
        return (
            <div>
                {this.state.isLoading && <LoadingScreenCharts />}
                <div className="row no-gutters">
                    <div className="col-auto">
                        <ValueChart data={
                            this.state.sumCallEnd
                        } name={"# CALLS"} />
                    </div>
                    <div className="col-auto">
                        <ValueChart data={
                            this.state.sumCallAttempt
                        } name={"# ATTEMPTS"} />
                    </div>
                    <div className="col-auto">
                        <ValueChart data={
                            this.state.durationSum
                        } name={"SUM DURATION"} />
                    </div>
                    <div className="col-auto">
                        <ValueChart data={
                            this.state.answerSeizureRatio
                        } name={"ASR (%)"} />
                    </div>
                    <div className="col-auto">
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
                    <div className="col-10 pr-1 mr-0">
                        <MultipleAreaChart data={
                            this.state.parallelCalls
                        } name={"PARALLEL CALLS"} id={"parallelCalls"} width={store.getState().width - 500} units={"count"} />
                    </div>
                    <div className="col-2 px-1">
                        <CountUpChart data={
                            this.state.callsActual
                        } name={"ACTUAL CALLS"} biggerFont={"biggerFont"} dataAgo={this.state.callsActualMinuteAgo} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <div className="col-10 pr-1 mr-0">
                        <MultipleAreaChart data={
                            this.state.parallelRegs
                        } name={"PARALLEL REGS"} id={"parallelRegs"} width={store.getState().width - 500} units={"count"} />
                    </div>
                    <div className="col-2 px-1">
                        <CountUpChart data={
                            this.state.regsActual
                        } name={"ACTUAL REGS"} biggerFont={"biggerFont"} dataAgo={this.state.regsActualMinuteAgo} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <div className="col-10 pr-1 mr-0">
                        <MultipleAreaChart data={
                            this.state.incidentCount
                        } name={"INCIDENTS"} units={"count"} id={"incidentCount"} width={store.getState().width - 500} />
                    </div>
                    <div className="col-2 px-1">
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
