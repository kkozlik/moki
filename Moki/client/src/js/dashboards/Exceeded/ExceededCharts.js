/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';

import Dashboard from '../Dashboard.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import DonutChart from '../../charts/donut_chart.js';
import ListChart from '../../charts/list_chart.js';
import ValueChart from '../../charts/value_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import DashboardsTypes from '../../helpers/DashboardsTypes';
import {parseListData, parseIp, parseStackedbarTimeData, parseBucketData, parseQueryStringData } from '@moki-client/es-response-parser';

class ExceededCharts extends Dashboard {

  // Initialize the state
  constructor(props) {
    super(props);
    this.state = {
      dashboardName: "exceeded/charts",
      eventCallsTimeline: [],
      exceededCount: [],
      exceededType: [],
      topOffenders: [],
      subnets: [],
      ipAddress: [],
      isLoading: true
    };
    this.callBacks = {
      functors: [
        //EVENT CALLS TIMELINE
        [{result: 'eventCallsTimeline', func: parseStackedbarTimeData}],

        //EXCEEDED COUNT
        [{result: 'exceededCount', func: parseQueryStringData}],

        //EXCEEDED TYPE
        [{result: 'exceededType', func: parseBucketData}],

        //TOP OFFENDERS
        [{result: 'topOffenders', func: parseListData}],

        //EVENTS BY IP ADDR 
        [{result: 'ipAddress', func: parseIp}],

        //TOP SUBNETS /24 EXCEEDED
        [{result: 'subnets', func: parseListData}]
      ]
    };
  }
  
    //render GUI
    render() {
        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            } <
            div className="row no-gutters" >
                <
                    div className="col" >
                    <
                        TimedateStackedChart id="eventsOverTime"
                        data={
                            this.state.eventCallsTimeline
                        }
                        units={"count"}
                        name={
                            "EVENTS OVER TIME"
                        }
                        keys={
                            DashboardsTypes["exceeded"]
                        }
                        width={
                            store.getState().width - 300
                        }
                    />  <
            /div>

            <div className="col" >
                        <ValueChart data={
                            this.state.exceededCount
                        }
                            name={
                                "INCIDENTS COUNT"
                            }
                            biggerFont={
                                "biggerFont"
                            }
                        />  </div>
                    <div className="col" >
                        <
                            DonutChart data={
                                this.state.exceededType
                            }
                            units={"count"}
                            name={
                                "EXCEEDED TYPE"
                            }
                            id="exceededType"
                            width={
                                (store.getState().width - 300) / 2
                            }
                            height={
                                170
                            }
                            legendSize={
                                50
                            }
                            field="exceeded" />
                    </div>
                </div> <
            div className="row no-gutters" >
                    <
            div className="col" >
                        <
                            ListChart data={
                                this.state.topOffenders
                            }
                            name={
                                "TOP OFFENDERS"
                            }
                            field={
                                "attrs.from.keyword"
                            }
                        />  <
            /div>
                <div className="col" >
                            <
                                ListChart data={
                                    this.state.subnets
                                }
                                name={
                                    "TOP SUBNETS /24 EXCEEDED"
                                }
                                field={
                                    "attrs.sourceSubnets"
                                }
                            />  <
            /div>
            <
                                div className="col" >
                                <
                                    ListChart data={
                                        this.state.ipAddress
                                    }
                                    name={
                                        "EXCEEDED EVENTS BY IP ADDR"
                                    }
                                    field={
                                        "attrs.source"
                                    }
                                />  <
            /div>
                </div> </div>
        );
    }
}

export default ExceededCharts;
