/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';
import Dashboard from '../Dashboard.js';
import ValueChart from '../../charts/value_chart.js';
import MultipleAreaChart from '../../charts/multipleArea_chart';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import Geoipchart from '../../charts/geoip_map.js';
import DonutChart from '../../charts/donut_chart.js';
import ListChart from '../../charts/list_chart.js';
import store from "../../store/index";
import { parseListData, parseBucketData, parseAggCities, parseAggQuerySumValue, parseMultipleLineDataShareAxis, parseStackedbarTimeData } from '@moki-client/es-response-parser';


class RegistrationCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            dashboardName: "registration/charts",
            geoipMap: [],
            eventRegsTimeline: [],
            userAgents: [],
            topRegExpired: [],
            transportProtocol: [],
            parallelRegs: [],
            regsActual: [],
            geoipHashMap: [],
            types: [],
            isLoading: true
        }

        this.callBacks = {
            functors: [
                //GEOIP MAP 0
                [{ result: "geoipMap", func:parseAggCities}],
                //EVENT REGS TIMELINE 1
                [{ result: 'eventRegsTimeline', func: parseStackedbarTimeData, attrs: ["attrs.type"] }],
                //USER-AGENTS IN REG. NEW 2
                [{ result: 'userAgents', func: parseBucketData, attrs: ["attrs.from-ua"] }],
                //TOP REG. EXPIRED 3
                [{ result: 'topRegExpired', func: parseListData, attrs: ["attrs.from"] }],
                //TRANSPORT PROTOCOL 4
                [{ result: 'transportProtocol', func: parseBucketData, attrs: ["attrs.transport"] }],
                //PARALLEL REGS 5+6
                [{ result: 'parallelRegs', attrs: ["attrs.hostname"], func: parseMultipleLineDataShareAxis, type: "multipleLineData", details: ["Regs", "Regs-1d"] }],
                [],
                //ACTUALL REGS 7
                [{ result: 'regsActual', func: parseAggQuerySumValue, attrs: ["attrs.hostname"] }],
                //DISTRIBUTION HASH GEOIP MAP 8
                [{ result: 'geoipHashMap', func: parseAggCities }],
                //TYPES DISTRIBUTIONS
                [{ result: 'types', func: parseBucketData, attrs: ["attrs.type"] }]
            ]
        }
    }


    //render GUI
    render() {
        return (<div> {
            this.state.isLoading && < LoadingScreenCharts />
        } <div className="row no-gutters" >
                <TimedateStackedChart id="eventsOverTime"
                    data={this.state.eventRegsTimeline}
                    units={"count"}
                    name={"EVENTS OVER TIME"}
                    keys={"registration"}
                    width={store.getState().width - 300}
                />  </div>
            <div className="row no-gutters">
                <div className="col-10">
                    <MultipleAreaChart data={
                        this.state.parallelRegs
                    } name={"PARALLEL REGS"} id={"parallelRegs"} width={store.getState().width - 600} />
                </div>
                <div className="col-1">
                    <ValueChart data={
                        this.state.regsActual
                    } name={"ACTUAL REGS"} biggerFont={"biggerFont"} />
                </div>
            </div>

            <div className="row no-gutters" >
                <div className="col" >
                    <Geoipchart data={this.state.geoipMap}
                        dataNotShown={this.state.geoipHashMap}
                        type={"geoip"}
                        units={"count"}
                        width={
                            store.getState().width - 300
                        }
                        name="REGISTRATIONS MAP" />
                </div> </div> <div className="row no-gutters" >
                <div className="col" >
                    <DonutChart
                        data={this.state.types}
                        units={"count"}
                        name={"TYPES"}
                        field={"attrs.type"}
                        id="types"
                        width={400}
                        height={170}
                        legendSize={150}
                    /></div>
                <div className="col" >
                    <DonutChart data={
                        this.state.userAgents
                    }
                        units={"count"}
                        name={"USER-AGENTS IN REG. NEW"}
                        field={"attrs.from-ua"}
                        id="userAgents"
                        width={(store.getState().width / 2) - 100}
                        height={170}
                        legendSize={350}
                    />  </div>
                <div className="col" >
                    <DonutChart
                        data={this.state.transportProtocol}
                        name={"TRANSPORT PROTOCOL"}
                        units={"count"}
                        field={"attrs.transport"}
                        id="transportProtocol"
                        width={500}
                        height={170}
                        legendSize={50}
                    />  </div>
                <div className="col" >
                    <ListChart
                        data={this.state.topRegExpired}
                        name={"TOP REG. EXPIRED"}
                        field={"attrs.from.keyword"}
                    />
                </div>
            </div>
        </div>
        );
    }
}

export default RegistrationCharts;
