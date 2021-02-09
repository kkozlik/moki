/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import Dashboard from '../Dashboard.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
import DashboardsTypes from '../../helpers/DashboardsTypes';
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');


class TransportCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            dashboardName: "transport/charts",
            eventRegsTimeline: [],
            isLoading: true
        };
        this.callBacks = {
            functors: [
              [{result: 'eventRegsTimeline', func: parseStackedTimebar.parse}]
            ]
        };
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    componentDidMount() {
        this.loadData();
    }

    //render GUI
    render() {
        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            } <
            div className="row no-gutters" >
                <
                    TimedateStackedChart id="eventsOverTime"
                    data={
                        this.state.eventRegsTimeline
                    }
                    units={"count"}
                    name={
                        "EVENTS OVER TIME"
                    }
                    keys={
                        DashboardsTypes["transport"]
                    }
                    width={store.getState().width - 300}

                />  <
            /div> <
            /div>
        );
    }
}

export default TransportCharts;
