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
import { elasticsearchConnection } from '@moki-client/gui';
import storePersistent from "../../store/indexPersistent";
import { parseQueryStringData, parseDateHeatmap, parseAggData, parseAggSumBucketData, parseMultipleLineDataShareAxis, parseMultipleLineDataShareAxisWithoutAgg, parseAggQueryWithoutScriptValue, parseAggQuerySumValue } from '@moki-client/es-response-parser';

class HomeCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        //  this.loadData = this.loadData.bind(this);
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
    /*
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
    /*
     async loadData() {
 
         this.setState({ isLoading: true });
         var data = await elasticsearchConnection("/home/charts");
 
         if (typeof data === "string" && data.includes("ERROR:")) {
             console.log(typeof data === "string" && data.includes("ERROR:"));
 
             this.props.showError(data);
             this.setState({ isLoading: false });
             return;
 
         } else if (data) {
             const profile = storePersistent.getState().profile;
             //parse data
             //SUM CALL-END
             var sumCallEnd = parseQueryStringData(data.responses[0]);
 
             //SUM CALL-ATTEMPT
             var sumCallAttempt = parseQueryStringData(data.responses[1]);
 
             //DURATION SUM 
             var durationSum = parseAggData(data.responses[3]);
 
             //ANSWER-SEIZURE RATIO
             var answerSeizureRatio = parseAggSumBucketData(data.responses[4]);
 
             //AVG DURATION
             var avgDuration = parseAggData(data.responses[5]);
 
             // DATE HEATMAP
             var typeDateHeatmap = await parseDateHeatmap(data.responses[6], profile, ["attrs.type", "attrs.type"]);
 
             //PARALLEL CALLS
             var parallelCalls = parseMultipleLineDataShareAxis("Calls", data.responses[7], "Calls-1d", data.responses[8]);
 
             //PARALLEL REGS
             var parallelRegs = parseMultipleLineDataShareAxis("Regs", data.responses[9], "Regs-1d", data.responses[10]);
 
             //ACTUALL REGS
             var regsActual = parseAggQuerySumValue(data.responses[11]);
 
             //ACTUALL CALLS
             var callsActual = parseAggQuerySumValue(data.responses[12]);
 
             //INCIDENT COUNT
             var incidentCount = parseMultipleLineDataShareAxisWithoutAgg("Incident", data.responses[13], "Incident-1d", data.responses[14]);
 
             //ACTUALL INCIDENT
             var incidentActual = parseQueryStringData(data.responses[15]);
 
             //ACTUALL REGS MINUTE AGO
             var callsActualMinuteAgo = parseAggQuerySumValue(data.responses[16]);
 
             //ACTUALL CALLS MINUTE AGO
             var regsActualMinuteAgo = parseAggQuerySumValue(data.responses[17]);
 
             //ACTUALL INCIDENT MINUTE AGO
             var incidentActualMinuteAgo = parseQueryStringData(data.responses[18]);
 
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
 */
    //render GUI
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
                    <div className="col">
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
                    <div className="col">
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
                    <div className="col">
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
