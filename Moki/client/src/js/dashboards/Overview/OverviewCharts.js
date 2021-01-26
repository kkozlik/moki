/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateHeatmap from '../../charts/timedate_heatmap.js';
import BarChart from '../../charts/bar_chart.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import StackedChart from '../../charts/stackedbar.js';
import store from "../../store/index";
import DashboardsTypes from '../../helpers/DashboardsTypes';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import { elasticsearchConnection } from '../../helpers/elasticsearchConnection';
import ListChart from '../../charts/list_chart.js';
var parseDateHeatmap = require('../../parse_data/parseDateHeatmap.js');
const parseStackedbar = require('../../parse_data/parseStackedbarData.js');
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');
const parseBucketData = require('../../parse_data/parseBucketData.js');
var parseListData = require('../../parse_data/parseListData.js');

class OverviewCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);

        this.state = {
            eventCallsTimeline: [],
            totalEventsInInterval: [],
            activitySBC: [],
            keepAlive: [],
            tags: [],
            isLoading: true
        }
        store.subscribe(() => this.loadData());

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
        var data = await elasticsearchConnection("overview/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            this.props.showError(data);
            this.setState({ isLoading: false });
            return;
        } else if (data) {

            //EVENT OVERVIEW TIMELINE
            var eventOverviewTimeline = parseStackedTimebar.parse(data.responses[0]);

            //TOTAL EVENTS IN INTERVAL
            var totalEventsInInterval = parseStackedbar.parse(data.responses[1]);

            //ACTIVITY OF SBC
            var activitySBC = parseDateHeatmap.parse(data.responses[2]);

            //SBC - KEEP ALIVE
            var keepAlive = parseDateHeatmap.parse(data.responses[3]);

            //TAGS LIST
            var tags = parseListData.parse(data.responses[5]);


            console.info(new Date() + " MOKI OVERVIEW: finished parsing data");
            this.setState({
                eventCallsTimeline: eventOverviewTimeline,
                totalEventsInInterval: totalEventsInInterval,
                activitySBC: activitySBC,
                keepAlive: keepAlive,
                tags: tags,
                isLoading: false
            });

        }
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
