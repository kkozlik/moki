/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';

import Dashboard from '../Dashboard.js';
import TopologyChart from '../../charts/topology_chart.js';
import Heatmap from '../../charts/heatmap_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {parseHeatmapDataDecrypt, parseDateHeatmapDecrypt, parseTopologyDataDecrypt} from '@moki-client/es-response-parser';

class ConnectivityCharts extends Dashboard {

  // Initialize the state
  constructor(props) {
    super(props);
    this.state = {
      dashboardName: "connectivity/charts",
      fromTo: [],
      failure: [],
      callAtempts: [],
      duration: [],
      callEnds: [],
      isLoading: true
    };
    this.callBacks = {
      functors: [
        //FROM TO 
        [{result: 'fromTo', func: parseTopologyDataDecrypt}],

        //CONNECTION FAILURE RATIO 
        [{result: 'failure', func: parseHeatmapDataDecrypt}],

        //NUMBER OF CALL-ATTEMPS 
        [{result: 'callAtempts', func: parseDateHeatmapDecrypt}],

        //DURATION 
        [{result: 'duration', func: parseHeatmapDataDecrypt}],

        //NUMBER OF CALL-ENDS 
        [{result: 'callEnds', func: parseDateHeatmapDecrypt}]
      ]
    };
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
                            (store.getState().width - 300)
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
