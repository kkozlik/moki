/*
Class to get data for all charts in Conference dashboard
*/
import React, {
    Component
} from 'react';

import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import ListChart from '../../charts/list_chart.js';
import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {elasticsearchConnection} from '../../helpers/elasticsearchConnection';
import DashboardsTypes from '../../helpers/DashboardsTypes';

const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');
var parseQueryStringData = require('../../parse_data/parseQueryStringData.js');
var parseListData = require('../../parse_data/parseListData.js');
var parseAggData = require('../../parse_data/parseAggData.js');
var parseAggQueryWithoutScriptValue = require('../../parse_data/parseAggQueryWithoutScriptValue.js');
var parseListDataSort = require('../../parse_data/parseListDataSort.js');


class ConferenceCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
           sumCallEnd: [],
           sumCallStart: [],
           durationSum: [],
           durationAvg: [],
           avgParticipants: [],
           topConferences: [],
           eventCallsTimeline: [], 
           activeConf: 0,
           topActiveConferences: [],
           topParticipants: [],
           isLoading: false,
        }
        store.subscribe(() => this.loadData());
}
    
    
componentDidMount() {
    this.loadData();
}



  async loadData() {
      
            this.setState({isLoading: true}); 
            
            var data = await elasticsearchConnection("conference/charts");

            if(typeof data === "string" && data.includes("ERROR:")){
            
                 this.props.showError(data);
                 this.setState({isLoading: false});
                 return; 
                
            }else if(data){

                //SUM CONF-LEAVE
                var sumCallEnd = parseQueryStringData.parse(data.responses[0]);
       
                //SUM CONF-JOIN
                var sumCallStart = parseQueryStringData.parse(data.responses[1]);

               //DURATION SUM 
                var durationSum = parseAggData.parse(data.responses[2]);
                
                 //DURATION SUM 
                var durationAvg = parseAggData.parse(data.responses[3]);

                //AVG PARTICIPANTS
                var avgParticipants = [];
                if(data.responses[4] && data.responses[4].aggregations && data.responses[4].aggregations["avg_count"] &&  data.responses[4].aggregations["avg_count"].value){
                    avgParticipants = data.responses[4].aggregations["avg_count"].value;
                }

                //TOP CONFERENCES
                var topConferences = parseListData.parse(data.responses[5]);

                //EVENT CALLS TIMELINE
                var eventCallsTimeline = parseStackedTimebar.parse(data.responses[6]);
                
                //CONFERENCE ACTUAL
                var activeConf = parseAggQueryWithoutScriptValue.parse(data.responses[7]);
                
                //TOP ACTVIVE CONF
                var topActiveConferences = parseListDataSort.parse(data.responses[9]);           
                
                //TOP PARTICIPANTS
                var topParticipants = parseListData.parse(data.responses[8]);
                    
                console.info(new Date() + " MOKI CALLS: finished paring data");
           
                this.setState({
                   sumCallEnd: sumCallEnd,
                   sumCallStart: sumCallStart,
                   durationSum: durationSum,
                   avgParticipants: avgParticipants,
                   topConferences: topConferences,
                   eventCallsTimeline: eventCallsTimeline, 
                   durationAvg: durationAvg,
                   activeConf: activeConf,
                   topParticipants: topParticipants,
                   topActiveConferences: topActiveConferences,
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
                                this.state.activeConf
                            } name= {"ACTIVE CONFERENCES"}/> 
                    </div> 
                    <div className="col">
                            <ValueChart data = {
                                this.state.sumCallEnd
                            }  name= {"LEAVEs"}/> 
                    </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.sumCallStart
                            } name= {"JOINs"}/> 
                    </div>
                    <div className="col">
                        <ValueChart data = {
                                    this.state.durationSum
                                } name= {"MAX DURATION"}/> 
                        </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.durationAvg
                            } name= {"AVG DURATION"}/> 
                    </div>
                    <div className="col">
                            <ValueChart data = {
                                this.state.avgParticipants
                            } name= {"AVG PARTICIPANT"}/> 
                    </div> 
            
            </div>
            <div className = "row no-gutters" >
                    <TimedateStackedChart id="eventsOverTime" data = {
                        this.state.eventCallsTimeline
                    } name={"EVENTS OVER TIME"} keys={DashboardsTypes["conference"]}  width={store.getState().width-300}
                    /> 
            </div>
            <div className = "row no-gutters" >
                <div className="col">
                    <ListChart data = {
                        this.state.topConferences 
                    } name={"TOP CONFERENCES"} field= {"attrs.conf_id"}/> 
                </div>
                    <div className="col">
                    <ListChart data = {
                        this.state.topActiveConferences 
                    } name={"TOP ACTIVE CONFERENCES"} field= {"attrs.conf_id"}/> 
                </div>
                <div className="col">
                    <ListChart data = {
                        this.state.topParticipants 
                    } name={"TOP PARTICIPANTS"} field= {"attrs.from.keyword"}/> 
                </div>
            </div>
        </div>
        );
    }
}

export default ConferenceCharts;
