/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import ListChart from '../../charts/list_chart.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import DashboardsTypes from '../../helpers/DashboardsTypes';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
import CountUpChart from '../../charts/count_chart.js';
import Geoipchart from '../../charts/geoip_map.js';

const parseStackedTimebar = require('../../parse_data/parseStackedbarTimeData.js');
var parseListData = require('../../parse_data/parseListData.js');
var parseQueryStringData = require('../../parse_data/parseQueryStringData.js');

class WebCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);

        this.state = {
            eventRegsTimeline: [],
            eventsByIP: [],
            totalEvents: [],
            eventsByCountry: [],
            userAgents: [],
            geoipMap: [],
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

        var data = await elasticsearchConnection("web");

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

            if (data.responses[5].aggregations && data.responses[5].aggregations.cities && data.responses[5].aggregations.cities.buckets) {
                geoipMap = data.responses[5].aggregations.cities.buckets;
            }

            //EVENT SECURITY TIMELINE
            var eventRegsTimeline = parseStackedTimebar.parse(data.responses[0]);

            //EVENTS BY IP ADDR
            var eventsByIP = data.responses[1].aggregations ? data.responses[1].aggregations.distinct.value : 0;

            //TOTAL EVENT COUNT
            var totalEvents = parseQueryStringData.parse(data.responses[2]);

            //EVENTS BY COUNTRY
            var eventsByCountry = parseListData.parse(data.responses[3]);

            //TOP USER AGENTS
            var userAgents = parseListData.parse(data.responses[4]);

            console.info(new Date() + " MOKI Security: finished parsíng data");

            this.setState({
                eventRegsTimeline: eventRegsTimeline,
                eventsByIP: eventsByIP,
                totalEvents: totalEvents,
                eventsByCountry: eventsByCountry,
                userAgents: userAgents,
                geoipMap: geoipMap,
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
                <div className="col-3" >
                    <CountUpChart data={
                        this.state.totalEvents}
                        type={"countUP"} name={"EVENTS"} biggerFont={"biggerFont"} autoplay={true} displayAnimation="none"/>
                </div>
                <div className="col-3" >
                    <CountUpChart data={
                        this.state.eventsByIP
                    } type={"distinct"}  name={"DISTINCT IPs"} biggerFont={"biggerFont"}  autoplay={true} displayAnimation="none"/>
                </div>
                <div className="col-3" >
                    <ListChart data={
                        this.state.eventsByCountry
                    }
                        name={
                            "BY COUNTRY"
                        }
                        type="list"
                        field={
                            "geoip.country_name"
                        }
                        autoplay={true}
                    />  </div>
                <div className="col-3" >
                    <ListChart data={
                        this.state.userAgents
                    }
                        name={
                            "TOP USER AGENTS"
                        }
                        type="list"
                        field={
                            "attrs.src-ua"
                        } 
                        autoplay={true}
                        />  </div>
            </div>

            <div className="row no-gutters" >
                <div className="col" >
                    <Geoipchart data={
                        this.state.geoipMap
                    }
                        type={"geoip"}
                        name={"SECURITY GEO EVENTS"}
                        units={"count"}
                        width={
                            store.getState().width - 300
                        }
                        autoplay={true}
                    /> </div> </div>
            <div className="row no-gutters" >
                <TimedateStackedChart id="eventsOverTime"
                    data={
                        this.state.eventRegsTimeline
                    }
                    name={
                        "EVENTS OVER TIME"
                    }
                    units={"count"}
                    keys={
                        DashboardsTypes["overview"]
                    }
                    animation={true}
                    width={
                        store.getState().width - 300
                    } />  </div>

        </div >
        );
    }
}

export default WebCharts;
