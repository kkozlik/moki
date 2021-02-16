/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';

import Dashboard from '../Dashboard.js';
import TopologyChart from '../../charts/topology_chart.js';
import Heatmap from '../../charts/heatmap_chart.js';
import TimedateHeatmap from '../../charts/timedate_heatmap.js';
import ValueChart from '../../charts/value_chart.js';
import MultivalueChart from '../../charts/multivalue_chart.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import {parseHeatmapData, parseDateHeatmap, parseDateHeatmapAgg, parseHeatmapDataAgg1, parseHeatmapDataAgg3, parseQueryStringData, parseAggData, parseTopologyData, parseMultipleData, parseHeatmapDataAgg} from 'es-response-parser';

class ConnectivityCACharts extends Dashboard {

    // Initialize the state
  constructor(props) {
    super(props);
    this.state = {
      dashboardName: "connectivityCA/charts",
      fromToCA: [],
      sumCallEnd: [],
      sumCallAttempt: [],
      durationSum: [],
      failureCA: [],
      callAtemptsCA: [],
      callEndsCA: [],
      codeAnalysis: [],
      ratioHistory: [],
      caAvailability: [],
      durationCA: [],
      statsCA: [],
      sumCallStart: [],
      avgMoS: [],
      isLoading: true,
    };
    this.callBacks = {
      functors: [
        //FROM TO CA
        [{result: 'fromToCA', func: parseTopologyData}],

        //DURATION SUM
        [{result: 'durationSum', func: parseAggData}],

        //SUM CALL-ATTEMPT
        [{result: 'sumCallAttempt', func: parseQueryStringData}],

        //SUM CALL-END
        [{result: 'sumCallEnd', func: parseQueryStringData}],

        //CONNECTION FAILURE RATIO CA
        [{result: 'failureCA', func: parseHeatmapDataAgg}],

        //NUMBER OF CALL-ATTEMPS CA
        [{result: 'callAtemptsCA', func: parseDateHeatmap}],

        //NUMBER OF CALL-ENDA CA
        [{result: 'callEndsCA', func: parseDateHeatmap}],

        //ERROR CODE ANALYSIS
        [{result: 'codeAnalysis', func: parseHeatmapData}],

        //CA RATIO HISTORY
        [{result: 'ratioHistory', func: parseDateHeatmapAgg}],

        //CA AVAILABILITY
        [{result: 'caAvailability', func: parseHeatmapDataAgg1}],

        //DURATION CA
        [{result: 'durationCA', func: parseHeatmapDataAgg3}],

        //DESTINATIONS CAs STATISTICS
        [{result: 'statsCA', func: parseMultipleData}],

        //SOURCE CAs STATISTICS
        [{result: 'sourceStatsCA', func: parseMultipleData}],

        //NUMBER OF CALL-START CA
        [{result: 'sumCallStart', func: parseQueryStringData}],

        //AVG MoS
        [{result: 'avgMoS', func: parseDateHeatmapAgg}]
      ]
    };
  }

  //render GUI
  render() {
      return (<div> {
          this.state.isLoading && < LoadingScreenCharts />
      } <div className="row no-gutters" >
              <div className="col" >
                  <ValueChart data={
                      this.state.sumCallEnd
                  }
                      name={
                          "ENDs"
                      } />  </div> <div className="col" >
                  <ValueChart data={
                      this.state.sumCallAttempt
                  }
                      name={
                          "ATTEMPTs"
                      }
                  />  </div>
              <div className="col" >
                  <ValueChart data={
                      this.state.sumCallStart
                  }
                      name={
                          "STARTs"
                      }
                  />  </div>
              <div className="col" >
                  <ValueChart data={
                      this.state.durationSum
                  }
                      name={
                          "SUM DURATION"
                      }
                  />  </div>  </div>
          <div className="row no-gutters" >
              <MultivalueChart data={
                  this.state.statsCA
              }
                  field="attrs.dst_ca_id"
                  id="statsCA"
                  name={
                      "DESTINATIONS CAs STATISTICS"
                  }
                  name1={
                      "CA name"
                  }
                  name2={
                      "AVG failure (%)"
                  }
                  name3={
                      "Minutes"
                  }
                  name4={
                      "Attempts"
                  }
                  name5={
                      "Ends"
                  }
                  name6={
                      "Starts"
                  }
              />  </div>
          <div className="row no-gutters">
              <MultivalueChart data={
                  this.state.sourceStatsCA
              }
                  field="attrs.src_ca_id"
                  id="srcStatsCA"
                  name={
                      "SOURCE CAs STATISTICS"
                  }
                  name1={
                      "CA name"
                  }
                  name2={
                      "AVG failure (%)"
                  }
                  name3={
                      "Minutes"
                  }
                  name4={
                      "Ends"
                  }
                  name5={
                      "Attempts"
                  }
                  name6={
                      "Starts"
                  }
              />
          </div>
          <div className="row no-gutters" >
              <TopologyChart data={
                  this.state.fromToCA
              }
                  name={
                      "FROM TO CA"
                  }
                  type="topology"
                  width={
                      store.getState().width - 300
                  }
                  height={
                      400
                  }
                  units={
                      "count"
                  }
              />  </div> <div className="row no-gutters" >
              <div className="col" >
                  <Heatmap data={
                      this.state.failureCA
                  }
                      type="4agg"
                      marginLeft={
                          "150"
                      }
                      id="failureCA"
                      name={
                          "CONNECTION FAILURE RATIO CA"
                      }
                      width={
                          (store.getState().width - 300) / 2
                      }
                      field={
                          "attrs.src_ca_id"
                      }
                      field2={
                          "attrs.dst_ca_id"
                      }
                      marginBottom={
                          80
                      }
                      units={
                          "AVG %"
                      }
                  />  </div> <div className="col" >
                  <Heatmap data={
                      this.state.callAtemptsCA
                  }
                      marginLeft={
                          "150"
                      }
                      type="2agg"
                      id="callAtemptsCA"
                      name={
                          "NUMBER OF CALL-ATTEMPS CA"
                      }
                      width={
                          (store.getState().width - 300) / 2
                      }
                      field2={
                          "attrs.dst_ca_id"
                      }
                      field={
                          "attrs.src_ca_id"
                      }
                      marginBottom={
                          80
                      }
                      units={
                          "count"
                      }
                  />  </div> <div className="col" >
                  <Heatmap data={
                      this.state.callEndsCA
                  }
                      type="2agg"
                      marginLeft={
                          "150"
                      }
                      id="callEndsCA"
                      name={
                          "NUMBER OF CALL-ENDS CA"
                      }
                      width={
                          (store.getState().width - 300) / 2
                      }
                      field2={
                          "attrs.dst_ca_id"
                      }
                      field={
                          "attrs.src_ca_id"
                      }
                      marginBottom={
                          80
                      }
                      units={
                          "count"
                      }
                  />  </div> <div className="col" >
                  <Heatmap data={
                      this.state.durationCA
                  }
                      marginLeft={
                          "150"
                      }
                      id="durationCA"
                      name={
                          "AVG DURATION OF CALLS CA"
                      }
                      type={"4agg"}
                      width={
                          (store.getState().width - 300) / 2
                      }
                      field2={
                          "attrs.dst_ca_id"
                      }
                      field={
                          "attrs.src_ca_id"
                      }
                      marginBottom={
                          80
                      }
                  />  </div> <div className="col" >
                  <Heatmap data={
                      this.state.codeAnalysis
                  }
                      type="4aggdoc"
                      marginLeft={150}
                      id="codeAnalysis"
                      name={
                          "ERROR CODE ANALYSIS"
                      }
                      width={
                          store.getState().width - 300
                      }
                      field2={
                          "attrs.src_ca_id"
                      }
                      field={
                          "attrs.sip-code"
                      }
                      marginBottom={
                          80
                      }
                      units={
                          "count"
                      }
                  />  </div>
              <div className="col" >
                  <TimedateHeatmap data={
                      this.state.avgMoS
                  }
                      marginLeft={
                          "150"
                      }
                      id="avgMoS"
                      name={
                          "AVG MoS"
                      }
                      width={
                          store.getState().width - 300
                      }
                      field={
                          "attrs.rtp-MOScqex-avg"
                      }
                      units={
                          "AVG"
                      }
                  />
              </div> <div className="col" >
                  <TimedateHeatmap data={
                      this.state.ratioHistory
                  }
                      marginLeft={
                          "150"
                      }
                      id="ratioHistory"
                      name={
                          "CA RATIO HISTORY"
                      }
                      width={
                          store.getState().width - 300
                      }
                      field={
                          "attrs.src_ca_id"
                      }
                      units={
                          "AVG %"
                      }
                  />  </div> <div className="col" >
                  <TimedateHeatmap data={
                      this.state.caAvailability
                  }
                      marginLeft={
                          "150"
                      }
                      id="caAvailability"
                      name={
                          "CA AVAILABILITY"
                      }
                      width={
                          store.getState().width - 300
                      }
                      field={
                          "attrs.dest_ca_name"
                      }
                  />  </div> </div> </div>
      );
  }
}

export default ConnectivityCACharts;
