/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';

import Dashboard from '../Dashboard.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import ListChart from '../../charts/list_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import DashboardsTypes from '../../helpers/DashboardsTypes';
import CountUpChart from '../../charts/count_chart.js';
import Geoipchart from '../../charts/geoip_map.js';
import {parseListData, parseAggDistinct, parseAggCities, parseStackedbarTimeData, parseQueryStringData} from 'es-response-parser';

class WebCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            dashboardName: "web",
            eventRegsTimeline: [],
            eventsByIP: [],
            totalEvents: [],
            eventsByCountry: [],
            userAgents: [],
            geoipMap: [],
            sLoading: true

        };
        this.callBacks = {
            functors: [
              //EVENT SECURITY TIMELINE
              [{result: 'eventRegsTimeline', func: parseStackedbarTimeData}],

              //EVENTS BY IP ADDR
              [{result: 'eventsByIP', func: parseAggDistinct}],

              //TOTAL EVENT COUNT
              [{result: 'totalEvents', func: parseQueryStringData}],

              //EVENTS BY COUNTRY
              [{result: 'eventsByCountry', func: parseListData}],

              //TOP USER AGENTS
              [{result: 'userAgents', func: parseListData}],
              
              //DISTRIBUTION GEOIP MAP
              [{result: 'geoipMap', func: parseAggCities}]
            ]
        };
    }

    //render GUI
    render() {
        return (<div> {
            this.state.isLoading && < LoadingScreenCharts />
        }
            <div className="row no-gutters" >
                <div className="col-3" >
                    <CountUpChart data={
                        this.state.totalEvents}
                        type={"countUP"} name={"EVENTS"} biggerFont={"biggerFont"} autoplay={true} displayAnimation="none" />
                </div>
                <div className="col-3" >
                    <CountUpChart data={
                        this.state.eventsByIP
                    } type={"distinct"} name={"DISTINCT IPs"} biggerFont={"biggerFont"} autoplay={true} displayAnimation="none" />
                </div>
                <div className="col-3" >
                    <ListChart data={
                        this.state.eventsByCountry
                    }
                        name={
                            "BY COUNTRY"
                        }
                        type="list"
                        field={
                            "geoip.country_name"
                        }
                        autoplay={true}
                    />  </div>
                <div className="col-3" >
                    <ListChart data={
                        this.state.userAgents
                    }
                        name={
                            "TOP USER AGENTS"
                        }
                        type="list"
                        field={
                            "attrs.src-ua"
                        }
                        autoplay={true}
                    />  </div>
            </div>

            <div className="row no-gutters" >
                <div className="col" >
                    <Geoipchart data={
                        this.state.geoipMap
                    }
                        type={"geoip"}
                        name={"SECURITY GEO EVENTS"}
                        units={"count"}
                        width={
                            store.getState().width - 300
                        }
                        autoplay={true}
                    /> </div> </div>
            <div className="row no-gutters" >
                <TimedateStackedChart id="eventsOverTime"
                    data={
                        this.state.eventRegsTimeline
                    }
                    name={
                        "EVENTS OVER TIME"
                    }
                    units={"count"}
                    keys={
                        DashboardsTypes["overview"]
                    }
                    animation={true}
                    width={
                        store.getState().width - 300
                    } />  </div>

        </div >
        );
    }
}

export default WebCharts;
