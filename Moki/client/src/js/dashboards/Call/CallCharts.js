/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';

import Dashboard from '../Dashboard.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import SunburstChart from '../../charts/sunburst_chart.js';
import DonutChart from '../../charts/donut_chart.js';
import DatebarChart from '../../charts/datebar_chart.js';
import ListChart from '../../charts/list_chart.js';
import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import DashboardsTypes from '../../helpers/DashboardsTypes';
import {parseListData, parseStackedbarTimeData, parseBucketData, parseSunburstData, parseQueryStringData, parseAggData, parseAggSumBucketData} from '../../es-response-parser/index.js';



class CallCharts extends Dashboard {

  // Initialize the state
  constructor(props) {
      super(props);
      this.specialLoadData = this.specialLoadData.bind(this);
      this.state = {
        dashboardName: "calls/charts",
        eventCallsTimeline: [],
        callTerminated: [],
        callSuccessRatio: [],
        sumCallAttempt: [],
        sumCallEnd: [],
        sumCallStart: [],
        durationSum: [],
        avgMoS: [],
        answerSeizureRatio: [],
        durationGroup: [],
        sipcodeCount: [], 
        calledCountries: [],
        sumDurationOverTime: [],
        callingCountries: [],
        avgDuration: [],
        maxDuration: [],
        isLoading: false,
        asrDurationOverTime: []
      };
      this.callBacks = {
        functors: [
          //CALL TERMINATED
          [{result: 'callTerminated', func: parseBucketData}],
          //CALL SUCCESS RATIO
          [{result: 'callSuccessRatio', func: parseSunburstData}],
          //SUM CALL-ATTEMPT
          [{result: 'sumCallAttempt', func: parseQueryStringData}],
          //SUM CALL-END
          [{result: 'sumCallEnd', func: parseQueryStringData}],
          //SUM CALL-START
          [{result: 'sumCallStart', func: parseQueryStringData}],
          //DURATION SUM 
          [{result: 'durationSum', func: parseAggData}],
          //AVG MoS
          [{result: 'avgMoS', func: parseAggData}],
          //ANSWER-SEIZURE RATIO
          [{result: 'answerSeizureRatio', func: parseAggSumBucketData}],
          //CALLING COUNTRIES
          [{result: 'callingCountries', func: parseListData}],
          //SUM DURATION OVER TIME
          [{result: 'sumDurationOverTime', func: parseBucketData}],
          //MAX DURATION
          [{result: 'maxDuration', func: parseAggData}],
          //AVG DURATION
          [{result: 'avgDuration', func: parseAggData}],
          //DURATION GROUP
          [{result: 'durationGroup', func: parseListData}],
          //SIP-CODE COUNT
          [{result: 'sipcodeCount', func: parseListData}],
          //CALLED COUNTRIES
          [{result: 'calledCountries', func: parseListData}],
          //EVENT CALLS TIMELINE
          [{result: 'eventCallsTimeline', func: parseStackedbarTimeData}],
          //ASR OVER TIME
          [{result: 'asrDurationOverTime', func: parseBucketData}]
        ]
      };
      /* override Dashboard.loadData() */ 
      this.unsubscribe();
      this.unsubscribe =  store.subscribe(() => this.specialLoadData());
  }

  componentDidMount() {
    this.specialLoadData();
  }

  /* specialLoadData overrides Dashboard.loadData due to sumCallEnd computation */
  async specialLoadData() {
    
    // call the superclass loadData()
    await super.loadData();
    
    this.setState({
        isLoading: true 
    });

    //hack - add sum of call end into success ratio
    if(this.state.sumCallEnd){
       this.transientState.callSuccessRatio.children.push({
          key: "success",
          value: this.state.sumCallEnd,
          children: []});
    }

    this.setState({callSuccessRatio: this.transientState.callSuccessRatio});
    this.setState({
        isLoading: false
    });
  }


    //render GUI
    render() {
         
        return (
            <div> 
           { this.state.isLoading && <LoadingScreenCharts />   } 

                <div className="row no-gutters">
                    <div className="col">
                            <ValueChart data = {
                                this.state.sumCallAttempt
                            } name= {"ATTEMPTs"}/> 
                    </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.sumCallEnd
                            }  name= {"ENDs"}/> 
                    </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.sumCallStart
                            } name= {"STARTs"}/> 
                    </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.answerSeizureRatio
                            } name= {"ASR (%)"}/> 
                    </div>
                    <div className="col">
                        <ValueChart data = {
                                    this.state.maxDuration
                                } name= {"MAX DURATION"}/> 
                        </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.avgDuration
                            } name= {"AVG DURATION"}/> 
                    </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.durationSum
                            } name= {"SUM DURATION"}/> 
                    </div> 
                    <div className="col">
                            <ValueChart data = {
                                this.state.avgMoS
                            } name= {"AVG MoS"}/> 
                    </div> 
            
            </div>
            <div className = "row no-gutters" >
                    <TimedateStackedChart id="eventsOverTime" data = {
                        this.state.eventCallsTimeline
                    } name={"EVENTS OVER TIME"} keys={DashboardsTypes["calls"]}  width={store.getState().width-300} units={"count"}
                    /> 
            </div>
              <div className = "row no-gutters" >
                    <DatebarChart data = { 
                        this.state.sumDurationOverTime} id={"sumDurationOverTime"} marginLeft={25} height={200}
                      name={"SUM DURATION OVER TIME"}  width={store.getState().width-300} />
            </div>
                <div className = "row no-gutters" >
                    <DatebarChart data = { 
                        this.state.asrDurationOverTime} id={"asrDurationOverTime"} marginLeft={25} height={200}
                      name={"ASR OVER TIME"}  width={store.getState().width-300} units={"%"} />
            </div>
                <div className = "row no-gutters" >
                    <div className="col">
                        <SunburstChart  data = {
                        this.state.callSuccessRatio
                            } name={"CALL SUCCESS RATIO"}  width={((store.getState().width-300)/2)+200} ends={this.state.sumCallEnd} units={"count"}/>
                    </div>
                <div className="col">
                    <DonutChart  data = {
                        this.state.callTerminated
                    } name={"CALL TERMINATED"} id="callTerminated" width={(store.getState().width-300)/2}  height={170} field={"attrs.originator"} legendSize={120} units={"count"}/>
                </div>
            </div>
          
            <div className = "row no-gutters" >
                <div className="col">
                    <ListChart data = {
                        this.state.callingCountries 
                    } name={"CALLING COUNTRIES"} field= {"geoip.country_code2"}/> 
                </div>
                <div className="col">
                    <ListChart  data = {
                        this.state.calledCountries
                    } name={"CALLED COUNTRIES"} field= {"attrs.dst_cc"}/> 
                </div>
                <div className="col">
                    <ListChart data = {
                        this.state.durationGroup 
                    } name={"DURATION GROUP"} field={"attrs.durationGroup"}/> 
                </div>
                <div className="col">
                <ListChart data = {
                        this.state.sipcodeCount
                    } name={"SIP-CODE COUNT"} field={"attrs.sip-code"}/> 
                </div>
            </div>
        </div>
        );
    }
}

export default CallCharts;
