/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import MultipleLineChart from '../../charts/multipleLine_chart';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
var parseMultipleLineData = require('../../parse_data/parseMultipleLineData.js');


class SystemCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            shortterm: [],
            midterm: [],
            longterm: [],
            memoryFree: [],
            memoryUsed: [],
            memoryCached: [],
            memoryBuffered: [],
            uas: [],
            uac: [],
            cpuUser: [],
            cpuSystem: [],
            cpuIdle: [],
            isLoading: false,
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
        var data = await elasticsearchConnection("system/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            console.log(typeof data === "string" && data.includes("ERROR:"));

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {
            //parse data
            //LOAD-SHORTTERM
            var shortterm = parseMultipleLineData.parse(data.responses[0]);

            //LOAD-midTERM
            var midterm = parseMultipleLineData.parse(data.responses[1]);

            //LOAD-SHORTTERM
            var longterm = parseMultipleLineData.parse(data.responses[2]);

            //MEMORY FREE
            var memoryFree = parseMultipleLineData.parse(data.responses[3]);

            //MEMORY USED
            var memoryUsed = parseMultipleLineData.parse(data.responses[4]);

            //MEMORY CACHED
            var memoryCached = parseMultipleLineData.parse(data.responses[5]);

            //MEMORY BUFFERED
            var memoryBuffered = parseMultipleLineData.parse(data.responses[6]);

            //UAS
            var uas = parseMultipleLineData.parse(data.responses[7]);


            //UAC
            var uac = parseMultipleLineData.parse(data.responses[8]);

            //CPU-USER
            var cpuUser = parseMultipleLineData.parse(data.responses[9]);
            //CPU-SYSTEM
            var cpuSystem = parseMultipleLineData.parse(data.responses[10]);

            //CPU-IDLE
            var cpuIdle = parseMultipleLineData.parse(data.responses[11]);

            console.info(new Date() + " MOKI System: finished parsíng data");

            this.setState({
                shortterm: shortterm,
                midterm: midterm,
                longterm: longterm,
                memoryFree: memoryFree,
                memoryUsed: memoryUsed,
                memoryCached: memoryCached,
                memoryBuffered: memoryBuffered,
                uas: uas,
                uac: uac,
                cpuUser: cpuUser,
                cpuSystem: cpuSystem,
                cpuIdle: cpuIdle,
                isLoading: false

            });
        }
    }


    //render GUI
    render() {

        return ( <
            div > {
                this.state.isLoading && < LoadingScreenCharts / >
            }

            <
            div className = "row no-gutters" >
            <
            div className = "col" >
            <
            MultipleLineChart id = "shortterm"
            data = {
                this.state.shortterm
            }
            name = {
                "LOAD-SHORTTERM"
            }
            width = {
                (store.getState().width-250) / 3
            }
            
            hostnames = {this.state.hostnames}
    
            ticks = {
                3
            }
            />                            <
            /div> <
            div className = "col" >
            <
            MultipleLineChart id = "midterm"
            data = {
                this.state.midterm
            }
            name = {
                "LOAD-MIDTERM"
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div> <
            div className = "col" >
            <
            MultipleLineChart id = "longterm"
            data = {
                this.state.longterm
            }
            name = {
                "LOAD-LONGTERM"
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div> <
            div className = "col" >
            <
            MultipleLineChart id = "memoryFree"
            data = {
                this.state.memoryFree
            }
            hostnames = {this.state.hostnames}
            name = {
                "MEMORY-FREE"
            }
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            div className = "col" >
            <
            MultipleLineChart id = "memoryUsed"
            data = {
                this.state.memoryUsed
            }
            hostnames = {this.state.hostnames}
            name = {
                "MEMORY-USED"
            }
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            div className = "col" >
            <
            MultipleLineChart id = "memoryCached"
            hostnames = {this.state.hostnames}
            data = {
                this.state.memoryCached
            }
            name = {
                "MEMORY-CACHED"
            }
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            div className = "col" >
            <
            MultipleLineChart id = "memoryBuffered"
            data = {
                this.state.memoryBuffered
            }
            hostnames = {this.state.hostnames}
            name = {
                "MEMORY-BUFFERED"
            }
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            div className = "col" >
            <
            MultipleLineChart id = "uas"
            data = {
                this.state.uas
            }
            name = {
                "UAS SIP trans."
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            div className = "col" >
            <
            MultipleLineChart id = "uac"
            data = {
                this.state.uac
            }
            name = {
                "UAC SIP trans."
            }
            hostnames = {this.state.hostnames}
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            div className = "col" >
            <
            MultipleLineChart id = "cpuUser"
            data = {
                this.state.cpuUser
            }
            hostnames = {this.state.hostnames}
            name = {
                "CPU-USER"
            }
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            div className = "col" >
            <
            MultipleLineChart id = "cpuSystem"
            data = {
                this.state.cpuSystem
            }
            hostnames = {this.state.hostnames}
            name = {
                "CPU-SYSTEM"
            }
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div> <
            div className = "col" >
            <
            MultipleLineChart id = "cpuIdle"
            data = {
                this.state.cpuIdle
            }
            hostnames = {this.state.hostnames}
            name = {
                "CPU-IDLE"
            }
            width = {
                (store.getState().width-250) / 3
            }
            ticks = {
                3
            }
            />                            <
            /div>

            <
            /div> <
            /div>
        );
    }
}

export default SystemCharts;
