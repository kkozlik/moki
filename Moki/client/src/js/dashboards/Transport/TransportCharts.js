/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
import DashboardsTypes from '../../helpers/DashboardsTypes';
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');


class TransportCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);

        this.state = {
            eventRegsTimeline: [],
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
        var data = await elasticsearchConnection("transport/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            console.log(typeof data === "string" && data.includes("ERROR:"));

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //parse data
            //EVENT REGS TIMELINE
            var eventRegsTimeline = parseStackedTimebar.parse(data.responses[0]);


            console.log(new Date() + " MOKI REGISTRATION: finished parsíng data");

            this.setState({
                eventRegsTimeline: eventRegsTimeline,
                isLoading: false
            });

        }
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
