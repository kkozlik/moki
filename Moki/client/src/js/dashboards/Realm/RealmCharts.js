/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import MultipleLineChart from '../../charts/multipleLine_chart';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
var parseMultipleLineData = require('../../parse_data/parseMultipleLineData.js');


class RealmCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            maxCallsFromByHost: [],
            maxCallsToByHost: [],
            maxCallsFromByrealm: [],
            maxCallsToByrealm: [],
            maxStartCallsFromByHost: [],
            maxStartCallsToByHost: [],
            maxStartCallsFromByrealm: [],
            maxStartCallsToByrealm: [],
            rtpToByHost: [],
            rtpFromByHost: [],
            rtpToByRealm: [],
            rtpFromByRealm: [],
            isLoading: true,
            hostnames: []

        }
        store.subscribe(() => this.loadData());

    }

    componentWillReceiveProps(nextProps){
      if(nextProps.hostnames !==  this.props.hostnames){
        this.setState({hostnames: nextProps.hostnames });
      }
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
        var data = await elasticsearchConnection("realm/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //parse data
            //MAX CALLS FROM BY HOST
            var maxCallsFromByHost = parseMultipleLineData.parse(data.responses[0]);

            //MAX CALLS To BY HOST
            var maxCallsToByHost = parseMultipleLineData.parse(data.responses[1]);

            ////MAX CALLS FROM BY REALM
            var maxCallsFromByrealm = parseMultipleLineData.parse(data.responses[2]);

            //MAX CALLS TO BY REALM
            var maxCallsToByrealm = parseMultipleLineData.parse(data.responses[3]);

            //MAX START CALLS FROM BY HOST
            var maxStartCallsFromByHost = parseMultipleLineData.parse(data.responses[4]);

            //MAX START CALLS To BY HOST
            var maxStartCallsToByHost = parseMultipleLineData.parse(data.responses[5]);


            //MAX START CALLS FROM BY REALM
            const maxStartCallsFromByrealm = parseMultipleLineData.parse(data.responses[6]);


            //MAX START CALLS TO BY REALM
            var maxStartCallsToByrealm = parseMultipleLineData.parse(data.responses[7]);

            //RTP RELAYED TO BY HOST
            var rtpToByHost = parseMultipleLineData.parse(data.responses[8]);

            //RTP RELAYED FROM BY HOST
            var rtpFromByHost = parseMultipleLineData.parse(data.responses[9]);

            //RTP RELAYED TO BY REALM
            var rtpToByRealm = parseMultipleLineData.parse(data.responses[10]);

            //RTP RELAYED FROM BY REALM
            var rtpFromByRealm = parseMultipleLineData.parse(data.responses[11]);




            console.info(new Date() + " MOKI NETWORK: finished parsíng data");

            this.setState({
                maxCallsFromByHost: maxCallsFromByHost,
                maxCallsToByHost: maxCallsToByHost,
                maxCallsFromByrealm: maxCallsFromByrealm,
                maxCallsToByrealm: maxCallsToByrealm,
                maxStartCallsFromByHost: maxStartCallsFromByHost,
                maxStartCallsToByHost: maxStartCallsToByHost,
                maxStartCallsFromByrealm: maxStartCallsFromByrealm,
                maxStartCallsToByrealm: maxStartCallsToByrealm,
                rtpToByHost: rtpToByHost,
                rtpFromByHost: rtpFromByHost,
                rtpToByRealm: rtpToByRealm,
                rtpFromByRealm: rtpFromByRealm,
                isLoading: false

            });
        }
    }


    //render GUI
    render() {
        return ( <
            div > {
                this.state.isLoading && < LoadingScreenCharts / >
            } <
            div className = "row no-gutters" >
            <
            div className = "col" >
            <
            MultipleLineChart id = "maxCallsFromByHost" 
            hostnames = {this.state.hostnames}
            data = {
                this.state.maxCallsFromByHost
            }
            name = {
                "MAX CALLS FROM BY HOST"
            }
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div > <
            div className = "col" >
            <
            MultipleLineChart id = "maxCallsToByHost"
            data = {
                this.state.maxCallsToByHost
            }
            name = {
                "MAX CALLS TO BY HOST"
            }
            width = {
                (store.getState().width -300)/3
            }
            hostnames = {this.state.hostnames}
            ticks = {
                3
            }
            />                            < /
            div > <
            div className = "col" >
            <
            MultipleLineChart id = "maxCallsFromByrealm"
            data = {
                this.state.maxCallsFromByrealm
            }
            hostnames = {this.state.hostnames}
            name = {
                "MAX CALLS FROM BY REALM"
            }
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div > <
            div className = "col" >
            <
            MultipleLineChart id = "maxCallsToByrealm"
            data = {
                this.state.maxCallsToByrealm
            }
            name = {
                "MAX CALLS TO BY REALM"
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >

            <
            div className = "col" >
            <
            MultipleLineChart id = "maxStartCallsFromByHost"
            data = {
                this.state.maxStartCallsFromByHost
            }
            hostnames = {this.state.hostnames}
            name = {
                "MAX START CALLS FROM BY HOST"
            }
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >

            <
            div className = "col" >
            <
            MultipleLineChart id = "maxStartCallsToByHost"
            data = {
                this.state.maxStartCallsToByHost
            }
            hostnames = {this.state.hostnames}
            name = {
                "MAX START CALLS TO BY HOST"
            }
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >

            <
            div className = "col" >
            <
            MultipleLineChart id = "maxStartCallsFromByrealm"
            data = {
                this.state.maxStartCallsFromByrealm
            }
            hostnames = {this.state.hostnames}
            name = {
                "MAX START CALLS FROM BY REALM"
            }
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >

            <
            div className = "col" >
            <
            MultipleLineChart id = "maxStartCallsToByrealm"
            data = {
                this.state.maxStartCallsToByrealm
            }
            hostnames = {this.state.hostnames}
            name = {
                "MAX START CALLS TO BY REALM"
            }
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >

            <
            div className = "col" >
            <
            MultipleLineChart id = "rtpToByHost"
            data = {
                this.state.rtpToByHost
            }
            hostnames = {this.state.hostnames}
            name = {
                "RTP RELAYED TO BY HOST"
            }
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >

            <
            div className = "col" >
            <
            MultipleLineChart id = "rtpFromByHost"
            data = {
                this.state.rtpFromByHost
            }
            name = {
                "RTP RELAYED FROM BY HOST"
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >

            <
            div className = "col" >
            <
            MultipleLineChart id = "rtpToByRealm"
            data = {
                this.state.rtpToByRealm
            }
            name = {
                "RTP RELAYED TO BY REALM"
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div > <
            div className = "col" >
            <
            MultipleLineChart id = "rtpFromByRealm"
            data = {
                this.state.rtpFromByRealm
            }
            name = {
                "RTP RELAYED FROM BY REALM"
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width -300)/3
            }
            ticks = {
                3
            }
            />                            < /
            div >


            <
            /div> < /
            div >
        );
    }
}

export default RealmCharts;
