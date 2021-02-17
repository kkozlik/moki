/*
Class to get data for all charts iin Call dashboard
*/

import React from 'react';
import Dashboard from '../Dashboard.js';
import TimedateHeatmap from '../../charts/timedate_heatmap.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import StackedChart from '../../charts/stackedbar.js';
import store from "../../store/index";
import DashboardsTypes from '../../helpers/DashboardsTypes';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import ListChart from '../../charts/list_chart.js';
import {parseListData, parseDateHeatmap, parseStackedbarData, parseStackedbarTimeData} from '@moki-client/es-reponse-parser';

class OverviewCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            dashboardName: "overview/charts",
            eventCallsTimeline: [],
            totalEventsInInterval: [],
            activitySBC: [],
            keepAlive: [],
            tags: [],
            isLoading: true
        };
        this.callBacks = {
            functors: [
                //EVENT OVERVIEW TIMELINE
                [{result: 'eventOverviewTimeline', func: parseStackedbarTimeData}],

                //TOTAL EVENTS IN INTERVAL
                [{result: 'totalEventsInInterval', func: parseStackedbarData}],

                //ACTIVITY OF SBC
                [{result: 'activitySBC', func: parseDateHeatmap}],

                //SBC - KEEP ALIVE
                [{result: 'keepAlive', func: parseDateHeatmap}],
                
                // empty
                [],

                //TAGS LIST
                [{result: 'tags', func: parseListData}]
            ]
        };
    }

    //render GUI
    render() {
        return (
            <div>
                { this.state.isLoading && <LoadingScreenCharts />}
                <div className="row no-gutters" >
                    <TimedateStackedChart units={"count"} data={
                        this.state.eventCallsTimeline
                    } id="eventsOverTime" name={"EVENTS OVER TIME"} keys={DashboardsTypes["overview"]} width={store.getState().width - 300}
                    />
                </div>
                <div className="row no-gutters" >
                    <div className="col">
                        <StackedChart data={
                            this.state.totalEventsInInterval
                        } units={"count"} id="totalEvents" bottomMargin={80} keys={DashboardsTypes["overview"]} name={"TOTAL EVENTS IN INTERVAL"} width={store.getState().width / 2}
                        />
                    </div> <div className="col" >
                        <ListChart data={
                            this.state.tags
                        }
                            name={
                                "TOP TAGS"
                            }
                            field={
                                "attrs.tags"
                            }
                        />
                    </div>
                </div>
                <div className="row no-gutters">
                    <TimedateHeatmap data={
                        this.state.activitySBC
                    } marginLeft={"250"} name={"NODES - ACTIVITY"} units={"any event count"} id="activitySBC" field={"attrs.sbc"} width={store.getState().width - 300} />
                </div>
                <div className="row no-gutters">
                    <TimedateHeatmap units={"system event count"} data={
                        this.state.keepAlive
                    } marginLeft={"250"} name={"NODES - KEEP ALIVE"} id="keepAlive" field={"attrs.sbc"} width={store.getState().width - 300} />
                </div>
            </div>
        );
    }
}

export default OverviewCharts;
