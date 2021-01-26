/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import Geoipchart from '../../charts/geoip_map.js';
import DonutChart from '../../charts/donut_chart.js';
import ListChart from '../../charts/list_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import DashboardsTypes from '../../helpers/DashboardsTypes';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';

var parseListData = require('../../parse_data/parseListData.js');
var parseBucketData = require('../../parse_data/parseBucketData.js');
const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');


class SecurityCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);

        this.state = {
            geoipMap: [],
            eventRegsTimeline: [],
            eventsByIP: [],
            subnets: [],
            eventsByCountry: [],
            typesCount: [],
            sLoading: true

        }
        store.subscribe(() => this.loadData());

    }

    componentDidMount() {
        this.loadData();
    }



    /*
    Load data from elasticsearch
    get filters, types and timerange from GUI
    */
    async loadData() {

        var data = await elasticsearchConnection("security/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            console.log(typeof data === "string" && data.includes("ERROR:"));

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {
            //parse data
            //DISTRIBUTION GEOIP MAP
            var geoipMap = [];

            if (data.responses[0].aggregations && data.responses[0].aggregations.cities && data.responses[0].aggregations.cities.buckets) {
                geoipMap = data.responses[0].aggregations.cities.buckets;
            }

            //EVENT SECURITY TIMELINE
            var eventRegsTimeline = parseStackedTimebar.parse(data.responses[1]);

            //EVENTS BY IP ADDR
            var eventsByIP = parseListData.parse(data.responses[2]);

            //TOP SUBNETS /24
            var subnets = parseListData.parse(data.responses[3]);

            //EVENTS BY COUNTRY
            var eventsByCountry = parseListData.parse(data.responses[4]);

            //SECURITY TYPES EVENTS
            var typesCount = parseBucketData.parse(data.responses[5]);

            console.info(new Date() + " MOKI Security: finished parsíng data");

            this.setState({
                geoipMap: geoipMap,
                eventRegsTimeline: eventRegsTimeline,
                eventsByIP: eventsByIP,
                subnets: subnets,
                eventsByCountry: eventsByCountry,
                typesCount: typesCount,
                isLoading: false
            });

        }
    }


    //render GUI
    render() {
        return (<div> {
            this.state.isLoading && < LoadingScreenCharts />
        }
            <div className="row no-gutters" >
                <
                    TimedateStackedChart id="eventsOverTime"
                    data={
                        this.state.eventRegsTimeline
                    }
                    name={
                        "EVENTS OVER TIME"
                    }
                    units={"count"}
                    keys={
                        DashboardsTypes["security"]
                    }
                    width={
                        store.getState().width - 300
                    }
                />  </div> <div className="row no-gutters" >
                <div className="col" >
                    <
                        Geoipchart data={
                            this.state.geoipMap
                        }
                        type={"geoip"}
                        name={"SECURITY GEO EVENTS"}
                        units={"count"}
                        width={
                            store.getState().width - 300
                        }
                    /> </div> </div> <div className="row no-gutters" >
                <div className="col" >
                    <DonutChart data={this.state.typesCount}
                        units={"count"}
                        name={
                            "TYPES"
                        }
                        id="types"
                        width={
                            store.getState().width / 4 + 30
                        }
                        legendSize={
                            20
                        }
                        height={
                            200
                        }
                        field="attrs.type" />
                </div>
                <div className="col" >
                    <ListChart data={
                        this.state.eventsByIP
                    }
                        name={
                            "EVENTS BY IP ADDR"
                        }
                        field={
                            "attrs.source"
                        }
                        type="list"
                    />  </div> <div className="col" >
                    <ListChart data={
                        this.state.subnets
                    }
                        name={
                            "TOP SUBNETS"
                        }
                        type="list"
                        field={
                            "attrs.sourceSubnets"
                        }
                    />  </div> <div className="col" >
                    <ListChart data={
                        this.state.eventsByCountry
                    }
                        name={
                            "EVENTS BY COUNTRY"
                        }
                        type="list"
                        field={
                            "geoip.country_name"
                        }
                    />  </div>
            </div>
        </div>
        );
    }
}

export default SecurityCharts;
