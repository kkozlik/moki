/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TopologyChart from '../../charts/topology_chart.js';
import Heatmap from '../../charts/heatmap_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
const parseHeatmapData = require('../../parse_data/parseHeatmapData.js');
var parseDateHeatmap = require('../../parse_data/parseDateHeatmap.js');
var parseTopologyData = require('../../parse_data/parseTopologyData.js');

class ConnectivityCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            fromTo: [],
            failure: [],
            callAtempts: [],
            duration: [],
            callEnds: [],
            isLoading: true
        }
        store.subscribe(() => this.loadData());

    }

    componentDidMount() {
        this.loadData();
    }

    /*
    Load data from elasticsearch
    get filters, types and timerange
    */
    async loadData() {

        this.setState({
            isLoading: true
        });

        var data = await elasticsearchConnection("connectivity/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //parse data
            //FROM TO 
            var fromTo = parseTopologyData.parse(data.responses[0]);

            //CONNECTION FAILURE RATIO 
            var failure = parseHeatmapData.parse(data.responses[1]);

            //NUMBER OF CALL-ATTEMPS 
            var callAtempts = parseDateHeatmap.parse(data.responses[2]);

            //DURATION 
            var duration = parseHeatmapData.parse(data.responses[3]);

            //NUMBER OF CALL-ENDS 
            var callEnds = parseDateHeatmap.parse(data.responses[4]);


            console.info(new Date() + " MOKI ConnectivityCA: finished parsing data");

            this.setState({
                fromTo: fromTo,
                failure: failure,
                callAtempts: callAtempts,
                duration: duration,
                callEnds: callEnds,
                isLoading: false

            });
        }

    }


    //render GUI
    render() {
        return (<div> {
            this.state.isLoading && < LoadingScreenCharts />
        } <div className="row no-gutters" >
                <div className="col" >
                    <TopologyChart data={
                        this.state.fromTo
                    }
                        name={
                            "FROM TO"
                        }
                        width={
                            (store.getState().width - 300) / 2
                        }
                        height={
                            300
                        }
                        units={"count"}
                    />  </div>

                <div className="col" >
                    <Heatmap data={
                        this.state.callEnds
                    }
                        marginLeft={
                            "250"
                        }
                        id="callEnds"
                        name={
                            "NUMBER OF CALL ENDs"
                        }
                        units={"count"}
                        marginBottom={
                            250
                        }
                        width={
                            store.getState().width - 300
                        }
                        field2={
                            "attrs.from"
                        }
                        field={
                            "attrs.to"
                        }
                    />  </div> <div className="col" >
                    <Heatmap data={
                        this.state.failure
                    }
                        marginLeft={
                            "250"
                        }
                        id="failure"
                        name={
                            "CONNECTION FAILURE RATIO "
                        }
                        width={
                            store.getState().width - 300
                        }
                        field2={
                            "attrs.to"
                        }
                        units={"%"}
                        field={
                            "attrs.from"
                        }
                        marginBottom={
                            250
                        }
                    />  </div> <div className="col" >
                    <Heatmap data={
                        this.state.callAtempts
                    }
                        marginLeft={
                            "250"
                        }
                        id="callAtempts"
                        name={
                            "NUMBER OF CALL-ATTEMPS"
                        }
                        width={
                            store.getState().width - 300
                        }
                        marginBottom={
                            250
                        }
                        field={
                            "attrs.to"
                        }
                        field2={
                            "attrs.from"
                        }
                        units={"count"}
                    />  </div> <div className="col" >
                    <Heatmap data={
                        this.state.duration
                    }
                        marginLeft={
                            "250"
                        }
                        id="duration"
                        name={
                            "DURATION OF CALLS"
                        }
                        width={
                            store.getState().width - 300
                        }
                        marginBottom={
                            250
                        }
                        field={
                            "attrs.to"
                        }
                        field2={
                            "attrs.from"
                        }
                    />  </div> </div> </div>
        );
    }
}

export default ConnectivityCharts;
