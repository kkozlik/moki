/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import MultipleLineChart from '../../charts/multipleLine_chart';
import { elasticsearchConnection } from '../../helpers/elasticsearchConnection';
var parseMultipleLineData = require('../../parse_data/parseMultipleLineData.js');


class NetworkCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            callsByHost: [],
            regsByHost: [],
            callStartsByHost: [],
            relayedRtpByHost: [],
            rxBytesByHost: [],
            txBytesByHost: [],
            rxPacketByHost: [],
            txPacketByHost: [],
            rxBytesByInterface: [],
            txBytesByInterface: [],
            rxPacketByInterface: [],
            txPacketByInterface: [],
            blacklist: [],
            greylist: [],
            whitelist: [],
            isLoading: true,
            hostnames: []

        }
        store.subscribe(() => this.loadData());
    }


    componentDidMount() {
        this.loadData();

    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.hostnames !== prevState.hostnames) {
            return { hostnames: nextProps.hostnames };
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.hostnames !== this.props.hostnames) {
            this.setState({ hostnames: this.props.hostnames });
        }
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }


    /*
    Load data from elasticsearch
    get filters, types and timerange
    */
    async loadData() {
        this.setState({ isLoading: true });
        var data = await elasticsearchConnection("network/charts");
        if (typeof data === "string" && data.includes("ERROR:")) {
            this.props.showError(data);
            this.setState({ isLoading: false });
            return;

        } else if (data) {

            //parse data
            //CALLS BY HOST
            var callsByHost = parseMultipleLineData.parse(data.responses[0]);

            //REGS BY HOST
            var regsByHost = parseMultipleLineData.parse(data.responses[1]);

            //CALL STARTS BY HOST
            var callStartsByHost = parseMultipleLineData.parse(data.responses[2]);

            //RELAYED RTP BY HOST
            var relayedRtpByHost = parseMultipleLineData.parse(data.responses[3]);

            //RX BYTES BY HOST
            var rxBytesByHost = parseMultipleLineData.parse(data.responses[4]);

            //TX BYTES BY HOST
            var txBytesByHost = parseMultipleLineData.parse(data.responses[5]);

            //RX PACKET BY HOST
            var rxPacketByHost = parseMultipleLineData.parse(data.responses[6]);

            //TX PACKET BY HOST
            const txPacketByHost = parseMultipleLineData.parse(data.responses[7]);


            //RX BYTES BY INTERFACE
            var rxBytesByInterface = parseMultipleLineData.parse(data.responses[8]);

            //TX BYTES BY INTERFACE
            var txBytesByInterface = parseMultipleLineData.parse(data.responses[9]);

            //RX PACKETS BY INTERFACE
            var rxPacketByInterface = parseMultipleLineData.parse(data.responses[10]);

            //TX PACKETS BY INTERFACE
            var txPacketByInterface = parseMultipleLineData.parse(data.responses[11]);

            //IPS ON FW BLACKLIST BY HOST
            var blacklist = parseMultipleLineData.parse(data.responses[12]);

            //IPS ON FW GREYLIST BY HOST
            var greylist = parseMultipleLineData.parse(data.responses[13]);

            //IPS ON FW WHITELIST BY HOST
            const whitelist = parseMultipleLineData.parse(data.responses[14]);


            console.info(new Date() + " MOKI NETWORK: finished parsíng data");

            this.setState({
                callsByHost: callsByHost,
                regsByHost: regsByHost,
                callStartsByHost: callStartsByHost,
                relayedRtpByHost: relayedRtpByHost,
                rxBytesByHost: rxBytesByHost,
                txBytesByHost: txBytesByHost,
                rxPacketByHost: rxPacketByHost,
                txPacketByHost: txPacketByHost,
                rxBytesByInterface: rxBytesByInterface,
                txBytesByInterface: txBytesByInterface,
                rxPacketByInterface: rxPacketByInterface,
                txPacketByInterface: txPacketByInterface,
                blacklist: blacklist,
                greylist: greylist,
                whitelist: whitelist,
                isLoading: false

            });
        }
    }


    //render GUI
    render() {
        return (
            <div>
                { this.state.isLoading && <LoadingScreenCharts />}
                <div className="row no-gutters">
                    <div className="col">
                        <MultipleLineChart id="callsByHost" hostnames={this.state.hostnames} data={this.state.callsByHost} name={"CALLS BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>
                    <div className="col">
                        <MultipleLineChart id="regsByHost" hostnames={this.state.hostnames} data={this.state.regsByHost} name={"REGS BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>
                    <div className="col">
                        <MultipleLineChart id="callStartsByHost" hostnames={this.state.hostnames} data={this.state.callStartsByHost} name={"CALL STARTS BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>
                    <div className="col">
                        <MultipleLineChart id="relayedRtpByHost" hostnames={this.state.hostnames} data={this.state.relayedRtpByHost} name={"RELAYED RTP BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                    <div className="col">
                        <MultipleLineChart id="txBytesByHost" hostnames={this.state.hostnames} data={this.state.txBytesByHost} name={"TX BYTES BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                    <div className="col">
                        <MultipleLineChart id="rxPacketByHost" hostnames={this.state.hostnames} data={this.state.rxPacketByHost} name={"RX PACKET BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                    <div className="col">
                        <MultipleLineChart id="txPacketByHost" hostnames={this.state.hostnames} data={this.state.txPacketByHost} name={"TX PACKET BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                    <div className="col">
                        <MultipleLineChart id="rxBytesByInterface" hostnames={this.state.hostnames} data={this.state.rxBytesByInterface} name={"RX BYTES BY INTERFACE"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                    <div className="col">
                        <MultipleLineChart id="txBytesByInterface" hostnames={this.state.hostnames} data={this.state.txBytesByInterface} name={"TX BYTES BY INTERFACE"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                    <div className="col">
                        <MultipleLineChart id="rxPacketByInterface" hostnames={this.state.hostnames} data={this.state.rxPacketByInterface} name={"RX PACKETS BY INTERFACE"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                    <div className="col">
                        <MultipleLineChart id="txPacketByInterface" hostnames={this.state.hostnames} data={this.state.txPacketByInterface} name={"TX PACKETS BY INTERFACE"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>
                    <div className="col">
                        <MultipleLineChart id="blacklist" hostnames={this.state.hostnames} data={this.state.blacklist} name={"IPS ON FW BLACKLIST BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>
                    <div className="col">
                        <MultipleLineChart id="greylist" hostnames={this.state.hostnames} data={this.state.greylist} name={"IPS ON FW GREYLIST BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>
                    <div className="col">
                        <MultipleLineChart id="whitelist" hostnames={this.state.hostnames} data={this.state.whitelist} name={"IPS ON FW WHITELIST BY HOST"} width={(store.getState().width - 300) / 3} ticks={3}
                        />
                    </div>

                </div>
            </div>
        );
    }
}

export default NetworkCharts;
