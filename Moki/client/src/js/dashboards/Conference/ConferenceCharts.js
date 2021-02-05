/*
Class to get data for all charts in Conference dashboard
*/
import React, {
    Component
} from 'react';

import Dashboard from '../Dashboard.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import ListChart from '../../charts/list_chart.js';
import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {elasticsearchConnection} from '../../helpers/elasticsearchConnection';
import DashboardsTypes from '../../helpers/DashboardsTypes';
import parseListData from '../../parse_data/parseListData.js';

const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');
var parseQueryStringData = require('../../parse_data/parseQueryStringData.js');
var parseAggData = require('../../parse_data/parseAggData.js');
var parseAggQueryWithoutScriptValue = require('../../parse_data/parseAggQueryWithoutScriptValue.js');
var parseListDataSort = require('../../parse_data/parseListDataSort.js');


class ConferenceCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
           dashboardName: "conference/charts",
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
        this.callBacks = {
            functors: [
                //SUM CONF-LEAVE
                {result: 'sumCallEnd', func: parseQueryStringData.parse},
       
                //SUM CONF-JOIN
                {result: 'sumCallStart', func: parseQueryStringData.parse},

                //DURATION SUM 
                {result: 'durationSum', func: parseAggData.parse},
                
                //DURATION SUM 
                {result: 'durationAvg', func: parseAggData.parse},

                //AVG PARTICIPANTS
                {result: 'avgParticipants', func: parseAggAvgCnt.parse},

                //TOP CONFERENCES
                {result: 'topConferences', func: parseListData},

                //EVENT CALLS TIMELINE
                {result: 'eventCallsTimeline', func: parseStackedTimebar.parse},
                
                //CONFERENCE ACTUAL
                {result: 'activeConf', func: parseAggQueryWithoutScriptValue.parse},
                
                //TOP ACTVIVE CONF
                {result: 'topActiveConferences', func: parseListDataSort.parse},           
                
                //TOP PARTICIPANTS
                {result: 'topParticipants', func: parseListData}
            ]
        };
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
