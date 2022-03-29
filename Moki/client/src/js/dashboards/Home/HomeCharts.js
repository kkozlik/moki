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
                [], //don't delete
                //PARALLEL REGS 9+10
                [{ result: 'parallelRegs', func: parseMultipleLineDataShareAxis, type: "multipleLineData", details: ["Regs", "Regs-1d"] }],
                [], //don't delete
                //PARALLEL INCIDENT 13+14
                [{ result: 'incidentCount', func: parseMultipleLineDataShareAxisWithoutAgg, type: "multipleLineData", details: ["Incident", "Incident-1d"] }],
                [] //don't delete

            ]
        }
    }

    //special parsing data - last bucket from different parsing function
    //i = 0 - time interval ago;   i = 1 actual
    getLastValueInInterval(data, i) {
        if (data && data.length > 0 && data[1].values.length > 0) {
            //get last time interval
            if (i === 0) {
                var lastValue = data[1].values[data[1].values.length - 2];
                if (lastValue) {
                   return lastValue.value;
                }
                else {
                    return 0;
                }
            }
            else {
                var lastValue = data[1].values[data[1].values.length - 1];
                if (lastValue) {
                    return lastValue.value
                }
                else {
                    return 0;
                }
            }
        }
        return 0;
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
                        <CountUpChart data={this.getLastValueInInterval(this.state.parallelCalls, 1)} name={"ACTUAL CALLS"} biggerFont={"biggerFont"} dataAgo={this.getLastValueInInterval(this.state.parallelCalls, 0)} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <div className="col-10 pr-1 mr-0">
                        <MultipleAreaChart data={
                            this.state.parallelRegs
                        } name={"PARALLEL REGS"} id={"parallelRegs"} width={store.getState().width - 500} units={"count"} />
                    </div>
                    <div className="col-2 px-1">
                        <CountUpChart data={this.getLastValueInInterval(this.state.parallelRegs, 1)} name={"ACTUAL REGS"} biggerFont={"biggerFont"} dataAgo={this.getLastValueInInterval(this.state.parallelRegs, 0)} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <div className="col-10 pr-1 mr-0">
                        <MultipleAreaChart data={
                            this.state.incidentCount
                        } name={"INCIDENTS"} units={"count"} id={"incidentCount"} width={store.getState().width - 500} />
                    </div>
                    <div className="col-2 px-1">
                        <CountUpChart data={this.getLastValueInInterval(this.state.incidentCount, 1)} name={"INCIDENTS ACTUAL"} biggerFont={"biggerFont"} dataAgo={this.getLastValueInInterval(this.state.incidentCount, 0)} />
                    </div>
                </div>
            </div>
        );
    }
}

export default HomeCharts;
