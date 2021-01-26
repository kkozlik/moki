/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import SunburstChart from '../../charts/sunburst_chart.js';
import DonutChart from '../../charts/donut_chart.js';
import DatebarChart from '../../charts/datebar_chart.js';
import ListChart from '../../charts/list_chart.js';
import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {elasticsearchConnection} from '../../helpers/elasticsearchConnection';
import DashboardsTypes from '../../helpers/DashboardsTypes';

const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');
var parseBucketData = require('../../parse_data/parseBucketData.js');
var parseSunburstData = require('../../parse_data/parseSunburstData.js');
var parseQueryStringData = require('../../parse_data/parseQueryStringData.js');
var parseListData = require('../../parse_data/parseListData.js');
var parseAggData = require('../../parse_data/parseAggData.js');
var parseAggSumBucketData = require('../../parse_data/parseAggSumBucketData.js');



class CallCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
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
        }
        store.subscribe(() => this.loadData());
}
    
    
componentDidMount() {
    this.loadData();
}



  async loadData() {
      
            this.setState({isLoading: true}); 
            
            var data = await elasticsearchConnection("calls/charts");

            if(typeof data === "string" && data.includes("ERROR:")){
            
                 this.props.showError(data);
                 this.setState({isLoading: false});
                 return; 
                
            }else if(data){
                //parse data
                //CALL TERMINATED
                var callTerminated = parseBucketData.parse(data.responses[0]);

                //CALL SUCCESS RATIO
                var callSuccessRatio = parseSunburstData.parse(data.responses[1]);

                //SUM CALL-ATTEMPT
                var sumCallAttempt = parseQueryStringData.parse(data.responses[2]);


                //SUM CALL-END
                var sumCallEnd = parseQueryStringData.parse(data.responses[3]);
                
                //hack - add sum of call end into success ratio
                if(sumCallEnd){
                       callSuccessRatio.children.push({
                           key: "success",                     value: sumCallEnd, 
                           children: []});
                    }
       
                //SUM CALL-START
                var sumCallStart = parseQueryStringData.parse(data.responses[4]);

               //DURATION SUM 
                var durationSum = parseAggData.parse(data.responses[5]);

                //AVG MoS
                var avgMoS = parseAggData.parse(data.responses[7]);

                //ANSWER-SEIZURE RATIO
                var answerSeizureRatio = parseAggSumBucketData.parse(data.responses[8]);

                //CALLING COUNTRIES
                var callingCountries = parseListData.parse(data.responses[9]);

                //SUM DURATION OVER TIME
                var sumDurationOverTime = parseBucketData.parse(data.responses[10]);

                //MAX DURATION
                var maxDuration = parseAggData.parse(data.responses[11]);

                //AVG DURATION
                var avgDuration = parseAggData.parse(data.responses[13]);

                //DURATION GROUP
                var durationGroup = parseListData.parse(data.responses[14]);

                //SIP-CODE COUNT
                var sipcodeCount = parseListData.parse(data.responses[15]);

                //CALLED COUNTIRES
                var calledCountries = parseListData.parse(data.responses[16]);

                //EVENT CALLS TIMELINE
                var eventCallsTimeline = parseStackedTimebar.parse(data.responses[17]);
                
                
                //ASR OVER TIME
                var asrDurationOverTime = parseBucketData.parse(data.responses[18]);
                
                console.info(new Date() + " MOKI CALLS: finished parsíng data");
           
                this.setState({
                    eventCallsTimeline: eventCallsTimeline,
                    callSuccessRatio: callSuccessRatio,
                    callTerminated: callTerminated,
                    sumDurationOverTime: sumDurationOverTime,
                    callingCountries: callingCountries,
                    sumCallAttempt: sumCallAttempt,
                    sumCallEnd: sumCallEnd, 
                    sumCallStart: sumCallStart,
                    durationSum: durationSum,
                    avgMoS: avgMoS,
                    answerSeizureRatio: answerSeizureRatio,
                    maxDuration: maxDuration,
                    avgDuration: avgDuration,
                    sipcodeCount: sipcodeCount,
                    durationGroup: durationGroup,
                    calledCountries: calledCountries,
                    asrDurationOverTime: asrDurationOverTime,
                    isLoading: false 
                });
        }
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
