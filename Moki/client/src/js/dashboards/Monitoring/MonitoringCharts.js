/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import ValueChart from '../../charts/value_chart.js';
import CircleChart from '../../charts/circle_chart.js';
import GaugeChart from '../../charts/gauge_chart.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import MultiListChart from '../../charts/multiple_list_chart.js';
import ListChartMonitoring from '../../charts/list_chart_monitoring.js';
import MonitoringListChart from '../../charts/monitoring_list_chart.js';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';

class MonitoringCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);

        this.state = {
            avgResponseTime: 0,
            usedDiskSpace: 0,
            isLoading: true,
            availableDiskSpace: 0,
            cpu: 0,
            heapUsedPercent: 0,
            elasticsearchStatus: "",
            logstashStatus: "",
            loadAverage1m: 0,
            loadAverage5m: 0,
            loadAverage15m: 0,
            memoryBytes: 0,
            memoryFree: 0,
            memoryUsed: 0,
            disk: 0,
            eventStats: 0,
            indices: [],
            sbcTypeCount: []
        }
        store.subscribe(() => this.loadData());


    }

    componentDidMount() {
        this.loadData();
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    /*
    Load data from elasticsearch
    get filters, types and timerange from GUI
    */
    async loadData() {
        this.setState({
            isLoading: true
        });
        try {
            var data = await elasticsearchConnection("monitoring/charts");
            var events = await elasticsearchConnection("monitoring/events");
            var sbcEventsStats = await elasticsearchConnection("monitoring/sbc");
        }
        catch (error) {
            console.error("Error receiving data: " + error);
        }

        if (typeof data === "string" && data.includes("ERROR:")) {
            this.props.showError(data);
            this.setState({ isLoading: false });
            return;
        }
        if (typeof events === "string" && events.includes("ERROR:")) {
            this.props.showError(events);
            this.setState({ isLoading: false });
            return;
        }
        if (typeof sbcEventsStats === "string" && sbcEventsStats.includes("ERROR:")) {
            this.props.showError(sbcEventsStats);
            this.setState({ isLoading: false });
            return;
        }

        //get node name
        if (data && data[0] && data[0].hasOwnProperty("nodes")) {
            var node = Object.keys(data[0].nodes)[0];

            //CPU STATS
            // cpu
            var cpu = data[0].nodes[node].os.cpu.percent;

            // One-minute load average on the system
            var loadAverage1m = data[0].nodes[node].os.cpu.load_average["1m"];

            // Five-minute load average on the system
            var loadAverage5m = data[0].nodes[node].os.cpu.load_average["5m"];

            // 15-minute load average on the system
            var loadAverage15m = data[0].nodes[node].os.cpu.load_average["15m"];


            //MEMORY
            // Total amount of physical memory in bytes.
            var memoryBytes = data[0].nodes[node].os.mem.total_in_bytes / 1000000;

            // Percentage of free memory.
            var memoryFree = data[0].nodes[node].os.mem.free_percent;

            // Percentage of used memory.
            var memoryUsed = data[0].nodes[node].os.mem.used_percent;

            //DISK
            //  (Linux only) - Array of disk metrics for each device that is backing an Elasticsearch data path. These disk metrics are probed periodically and averages between the last probe and the current probe are computed.
            var disk = data[0].nodes[node].fs.io_stats.devices;

            var avgResponseTime = 0;
            //ELASTICSEARCH STATS  
            if (data[0].nodes[node].adaptive_selection[node] && data[0].nodes[node].adaptive_selection[node].avg_response_time_ns) {
                //avgResponseTime
                avgResponseTime = data[0].nodes[node].adaptive_selection[node].avg_response_time_ns / 1000;
            }

            //use disc space
            var usedDiskSpace = data[0].nodes[node].fs.least_usage_estimate.used_disk_percent;

            // available disk space
            var availableDiskSpace = data[0].nodes[node].fs.least_usage_estimate.available_in_bytes / 1000000;

            // heap used
            var heapUsedPercent = data[0].nodes[node].jvm.mem.heap_used_percent;
        }

        if (data && data[1] && data[1].hasOwnProperty("elasticsearch")) {
            //elasticsearch status
            var elasticsearchStatus = data[1].elasticsearch;


            //LOGSTASH       
            //logstash status
            var logstashStatus = data[1].logstash;

            if (data && data[2] && data[2].hasOwnProperty("indices")) {
                //indices
                var indices = data[2].indices;
            }
        }

        //EVENTS
        if (events && events.events) {
            var eventStats = events.events;
        }

        //SBC - type count
        var sbcTypeCount = [];

        if (sbcEventsStats && sbcEventsStats.aggregations && sbcEventsStats.aggregations.agg && sbcEventsStats.aggregations.agg.buckets) {
            sbcTypeCount = sbcEventsStats.aggregations.agg.buckets;
        }


        console.log(new Date() + " MOKI MONITORING: finished parsíng data");

        this.setState({
            avgResponseTime: avgResponseTime,
            usedDiskSpace: usedDiskSpace,
            availableDiskSpace: availableDiskSpace,
            cpu: cpu,
            isLoading: false,
            heapUsedPercent: heapUsedPercent,
            logstashStatus: logstashStatus,
            elasticsearchStatus: elasticsearchStatus,
            loadAverage1m: loadAverage1m,
            loadAverage5m: loadAverage5m,
            loadAverage15m: loadAverage15m,
            memoryBytes: memoryBytes,
            memoryFree: memoryFree,
            memoryUsed: memoryUsed,
            disk: disk,
            indices: indices,
            eventStats: eventStats,
            sbcTypeCount: sbcTypeCount

        });

    }



    //render GUI
    render() {
        return (<div > {
            this.state.isLoading && < LoadingScreenCharts />
        }

            <h4> CPU </h4> <div className="row no-gutters bottomMargin" >
                <GaugeChart data={
                    this.state.cpu
                }
                    name={
                        "CPU USAGE (%)"
                    }
                    id={
                        "used_cpu"
                    }
                    width={
                        300
                    }
                />

                <ValueChart data={
                    this.state.loadAverage1m
                }
                    name={
                        "1-MIN LOAD AVG"
                    }
                />

                <ValueChart data={
                    this.state.loadAverage5m
                }
                    name={
                        "5-MIN LOAD AVG"
                    }
                />

                <ValueChart data={
                    this.state.loadAverage15m
                }
                    name={
                        "15-MIN LOAD AVG"
                    }
                /> </div>
            <h4> MEMORY </h4> <div className="row no-gutters bottomMargin" >
               <ValueChart data={
                    this.state.memoryBytes
                }
                    name={
                        "TOTAL MEMORY (MB)"
                    }
                />

            </div> <h4> DISK(Linux only) </h4> <div className="row no-gutters bottomMargin" >

                <MultiListChart data={
                    this.state.disk
                }
                    name={
                        "DISK STATS"
                    }
                />  </div>


            <div className="row no-gutters bottomMargin" >
                <span> <h4 style={
                    {
                        "marginTop": "20px"
                    }
                } >
                    LOGSTASH < CircleChart data={
                        this.state.logstashStatus
                    }
                        id={
                            "logstash"
                        }
                    /></h4>


                    <
                        GaugeChart data={
                            this.state.heapUsedPercent
                        }
                        name={
                            "HEAP USED (%)"
                        }
                        id={
                            "used_heap"
                        }
                        width={
                            300
                        }
                    /> </span> <span> <h4 style={
                        {
                            "marginTop": "20px"
                        }
                    } > EVENTS STATS </h4>

                    <MonitoringListChart data={
                        this.state.eventStats
                    }
                    /></span>

            </div>

            <h4>
                ELASTICSEARCH < CircleChart data={
                    this.state.elasticsearchStatus
                }
                    id={
                        "elasticsearch"
                    }
                /></h4>
            <div className="row no-gutters bottomMargin" >
                <GaugeChart data={
                    this.state.usedDiskSpace
                }
                    name={
                        "USED DISK SPACE (%)"
                    }
                    id={
                        "used_disc"
                    }
                    width={
                        300
                    }
                /> <ValueChart data={
                    this.state.availableDiskSpace
                }
                    name={
                        "AVAILABLE DISK SPACE (MB)"
                    }
                />              <ValueChart data={
                    this.state.avgResponseTime
                }
                    name={
                        "AVG RESPONSE (ms)"
                    }
                /> </div> <div className="row no-gutters bottomMargin" >
                <ListChartMonitoring data={
                    this.state.indices
                }
                    name={
                        "INDICES STATS"
                    }
                /> </div>
            <div className="row no-gutters">
                <MultiListChart data={
                    this.state.sbcTypeCount
                } name={"SBC EVENTS COUNT"} field={"attrs.type"} />
            </div>
        </div>
        );
    }
}

export default MonitoringCharts;
