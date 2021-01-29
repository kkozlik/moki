/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import store from "../../store/index";
import BarChart from '../../charts/bar_chart.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
const parseHistogramData = require('../../parse_data/parseHistogramData.js');
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');


class QoSCharts extends Component {

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

        var data = await elasticsearchConnection("qos/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //QoS HISTOGRAM
            var QoSHistogram = parseHistogramData.parse(data.responses[0]);

            //MoS STATS
            var MoSStats = parseStackedTimebar.parse(data.responses[1]);


            console.info(new Date() + " MOKI QoS: finished parsíng data");
            this.setState({
                QoSHistogram: QoSHistogram,
                MoSStats: MoSStats,
                isLoading: false
            });
        }
    }



    //render GUI
    render() {
        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            }

            <
            div className="row no-gutters" >
                <
                    BarChart data={
                        this.state.QoSHistogram
                    }
                    units={"count"}
                    id="QoSHistogram"
                    bottomMargin={
                        100
                    }
                    type="histogram"
                    name={
                        "QoS HISTOGRAM"
                    }
                    width={
                        store.getState().width - 300
                    }
                />  <
                    TimedateStackedChart id="MoSStats"
                    units={"count"}
                    data={
                        this.state.MoSStats
                    }
                    name={
                        "MoS STATS"
                    }
                    keys={
                        ["*-2.58", "2.58-3.1", "3.1-3.6", "3.6-4.03", "4.03-*"]
                    }
                    width={
                        store.getState().width - 300
                    }
                />  <
            /div> <
            /div> 
        );
    }
}

export default QoSCharts;
