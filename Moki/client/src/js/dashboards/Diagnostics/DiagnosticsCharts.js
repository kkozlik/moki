/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import DashboardsTypes from '../../helpers/DashboardsTypes';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');


class DiagnosticsCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            eventDiagnosticTimeline: [],
            isLoading: true
        }
        store.subscribe(() => this.loadData());
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

    /*
    Load data from elasticsearch
    get filters, types and timerange from GUI
    */
    async loadData() {
        this.setState({
            isLoading: true
        });
        var data = await elasticsearchConnection("diagnostics/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            console.log(typeof data === "string" && data.includes("ERROR:"));
            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //EVENT Diagnostic TIMELINE
            var eventDiagnosticTimeline = parseStackedTimebar.parse(data.responses[0]);

            console.info(new Date() + " MOKI DIAGNOSTICS: finished parsíng data");
            this.setState({
                eventDiagnosticTimeline: eventDiagnosticTimeline,
                isLoading: false
            });
        }
    }



    //render GUI
    render() {
        console.log(store.getState().width);
        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            }

            <
            div className="row no-gutters" >
                <
                    TimedateStackedChart data={
                        this.state.eventDiagnosticTimeline
                    }
                    id="eventsOverTime"
                    name={
                        "EVENTS OVER TIME"
                    }
                    keys={
                        DashboardsTypes["diagnostics"]
                    }
                    units={"count"}
                    width={
                        store.getState().width - 300}
                />  <
            /div> <
            /div> 
        );
    }
}

export default DiagnosticsCharts;
