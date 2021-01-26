/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import store from "../../store/index";
import ListChart from '../../charts/list_chart.js';
import DonutChart from '../../charts/donut_chart.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
var parseListData = require('../../parse_data/parseListData.js');
var parseListDataCardinality = require('../../parse_data/parseListDataCardinality.js');
var parseBucketData = require('../../parse_data/parseBucketData.js');


class MicroanalysisCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            typesCount: [],
            fromUA: [],
            sipMethod: [],
            sipCode: [],
            topSubnets: [],
            prefixStripped: [],
            sourceIP: [],
            top10from: [],
            callerDomain: [],
            top10to: [],
            distinctDestinations: [],
            topCallAttempts: [],
            topCallEnds: [],
            destination: [],
            sumDuration: [],
            topDuration: [],
            topDuration5: [],
            topSBC: [],
            srcCA: [],
            dstCA: [],
            originator: [],
            isLoading: true
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

        this.setState({
            isLoading: true
        });
        var data = await elasticsearchConnection("microanalysis/charts");
        if (typeof data === "string" && data.includes("ERROR:")) {
            console.log(typeof data === "string" && data.includes("ERROR:"));

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //parse data
            //TYPES
            var typesCount = parseBucketData.parse(data.responses[0]);

            //FROM UA
            var fromUA = parseListData.parse(data.responses[1]);

            //SIP METHOD
            var sipMethod = parseListData.parse(data.responses[2]);

            //SIP CODE
            var sipCode = parseListData.parse(data.responses[3]);

            //TOP SUBNETS
            var topSubnets = parseListData.parse(data.responses[4]);

            //r-URI PREFIX STRIPPED
            var prefixStripped = parseListData.parse(data.responses[5]);

            //SOURCE IP ADDRESS
            var sourceIP = parseListData.parse(data.responses[6]);

            //TOP 10 FROM
            var top10from = parseListData.parse(data.responses[7]);

            //CALLER DOMAIN
            var callerDomain = parseListData.parse(data.responses[8]);

            //TOP 10 TO
            var top10to = parseListData.parse(data.responses[9]);

            //DOMAIN STATS
            var distinctDestinations = parseListDataCardinality.parse(data.responses[10]);

            //TOP CALL ATTEMPTS
            var topCallAttempts = parseListData.parse(data.responses[11]);

            //TOP CALL ENDS
            var topCallEnds = parseListData.parse(data.responses[12]);

            //DESTINATION BY R-URI
            var destination = parseListData.parse(data.responses[13]);

            //SUM DURATION
            var sumDuration = parseListDataCardinality.parse(data.responses[14]);

            //TOP DURATION
            var topDuration = parseListDataCardinality.parse(data.responses[15]);

            //TOP DURATION < 5 sec
            var topDuration5 = parseListData.parse(data.responses[16]);

            //TOP SBCs
            var topSBC = parseListData.parse(data.responses[17]);

            //SRC CA
            var srcCA = parseListData.parse(data.responses[18]);

            //DST CA
            var dstCA = parseListData.parse(data.responses[19]);

            //ORIGINATOR
            var originator = parseListData.parse(data.responses[20]);


            console.info(new Date() + " MOKI MICROANALYSIS: finished parsíng data");

            this.setState({
                typesCount: typesCount,
                fromUA: fromUA,
                sipMethod: sipMethod,
                sipCode: sipCode,
                topSubnets: topSubnets,
                prefixStripped: prefixStripped,
                sourceIP: sourceIP,
                top10from: top10from,
                callerDomain: callerDomain,
                top10to: top10to,
                distinctDestinations: distinctDestinations,
                topCallAttempts: topCallAttempts,
                topCallEnds: topCallEnds,
                destination: destination,
                sumDuration: sumDuration,
                topDuration: topDuration,
                topDuration5: topDuration5,
                topSBC: topSBC,
                srcCA: srcCA,
                dstCA: dstCA,
                originator: originator,
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
            DonutChart data = {
                this.state.typesCount
            }
            units = {"count"}
            name = {
                "TYPES"
            }
            id = "types"
            width = {
                store.getState().width / 2-150
            }
            legendSize = {
                50
            }
            height = {
                200
            }
            field = "attrs.type" / >
            <
            /div> <
            div className = "col" >
            <
            ListChart data = {
                this.state.fromUA
            }
            name = {
                "FROM UA"
            }
            field = {
                "attrs.from-ua"
            }
            />   < /
            div > <
            /div> <
            div className = "row no-gutters" >
            <
            div className = "col" >
            <
            ListChart data = {
                this.state.sipMethod
            }
            name = {
                "SIP METHOD"
            }
            field = {
                "attrs.method"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.sipCode
            }
            name = {
                "SIP CODE"
            }
            field = {
                "attrs.sip-code"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.topSubnets
            }
            name = {
                "TOP SUBNETS /24"
            }
            field = {
                "attrs.sourceSubnets"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.prefixStripped
            }
            name = {
                "r-URI"
            }
            field = {
                "attrs.r-uri-shorted"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.sourceIP
            }
            name = {
                "SOURCE IP ADDRESS"
            }
            field = {
                "attrs.source"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.srcCA
            }
            name = {
                "SRC CA"
            }
            field = {
                "attrs.src_ca_name"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.dstCA
            }
            name = {
                "DST CA"
            }
            field = {
                "attrs.dst_ca_name"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.originator
            }
            name = {
                "ORIGINATOR"
            }
            field = {
                "attrs.originator"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.top10from
            }
            name = {
                "TOP 10 FROM"
            }
            field = {
                "attrs.from.keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.callerDomain
            }
            name = {
                "CALLER DOMAIN"
            }
            field = {
                "attrs.from-domain"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.top10to
            }
            name = {
                "TOP 10 TO"
            }
            field = {
                "attrs.to.keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.distinctDestinations
            }
            name = {
                "DISTINCT DESTINATIONS"
            }
            field = {
                "attrs.from.keyword"
            }
            />  < /
            div >

            <
            div className = "col" >
            <
            ListChart data = {
                this.state.topCallAttempts
            }
            name = {
                "TOP CALL ATTEMPTS"
            }
            field = {
                "attrs.from.keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.topCallEnds
            }
            name = {
                "TOP CALL ENDS"
            }
            field = {
                "attrs.from-keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.destination
            }
            name = {
                "DESTINATION BY R-URI"
            }
            field = {
                "attrs.r-uri.keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.sumDuration
            }
            name = {
                "SUM DURATION"
            }
            field = {
                "attrs.from.keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.topDuration
            }
            name = {
                "TOP DURATION"
            }
            field = {
                "attrs.from.keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.topDuration5
            }
            name = {
                "TOP DURATION < 5 sec"
            }
            field = {
                "attrs.from.keyword"
            }
            />  < /
            div > <
            div className = "col" >
            <
            ListChart data = {
                this.state.topSBC
            }
            name = {
                "TOP SBCs LIST"
            }
            field = {
                "attrs.sbc"
            }
            />  < /
            div > <
            /div> < /
            div >
        );
    }
}

export default MicroanalysisCharts;
