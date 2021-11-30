/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';
import ValueChart from '../../charts/value_chart.js';
import MultipleAreaChart from '../../charts/multipleArea_chart';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import Geoipchart from '../../charts/geoip_map.js';
import DonutChart from '../../charts/donut_chart.js';
import ListChart from '../../charts/list_chart.js';
import store from "../../store/index";
import storePersistent from "../../store/indexPersistent";
import {
    elasticsearchConnection
} from '@moki-client/gui';
import { parseListData, parseBucketData, parseAggCities, parseAggQuerySumValue, parseMultipleLineDataShareAxis, parseStackedbarTimeData } from '@moki-client/es-response-parser';


class RegistrationCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);

        this.state = {
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
        var data = await elasticsearchConnection("registration/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //parse data
            //DISTRIBUTION GEOIP MAP
            var geoipMap = [];
            const profile = storePersistent.getState().profile;

            if (data.responses[0].aggregations && data.responses[0].aggregations.cities && data.responses[0].aggregations.cities.buckets) {
                geoipMap = data.responses[0].aggregations.cities.buckets;
            }

            //EVENT REGS TIMELINE
            var eventRegsTimeline = parseStackedbarTimeData(data.responses[1]);

            //USER-AGENTS IN REG. NEW
            var userAgents = parseBucketData(data.responses[2]);

            //TOP REG. EXPIRED
            var topRegExpired = await parseListData(data.responses[3], profile, ["attrs.from"]);

            //TRANSPORT PROTOCOL
            var transportProtocol = parseBucketData(data.responses[4]);

            //PARALLEL REGS
            var parallelRegs = parseMultipleLineDataShareAxis("Regs", data.responses[5], "Regs-1d", data.responses[6]);

            //ACTUALL REGS
            var regsActual = parseAggQuerySumValue(data.responses[7]);

            //DISTRIBUTION HASH GEOIP MAP
            var geoipHashMap = parseAggCities(data.responses[8]);

            //TYPES DISTRIBUTIONS
            var types = parseBucketData(data.responses[9]);

            console.info(new Date() + " MOKI REGISTRATION: finished parsing data");

            this.setState({
                geoipMap: geoipMap,
                eventRegsTimeline: eventRegsTimeline,
                userAgents: userAgents,
                topRegExpired: topRegExpired,
                transportProtocol: transportProtocol,
                parallelRegs: parallelRegs,
                regsActual: regsActual,
                geoipHashMap: geoipHashMap,
                types: types,
                isLoading: false
            });

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
                        width={(store.getState().width/2)-100}
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
