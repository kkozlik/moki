/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import Dashboard from '../Dashboard.js';
import store from "../../store/index";
import ListChart from '../../charts/list_chart.js';
import DonutChart from '../../charts/donut_chart.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import parseListData from '../../parse_data/parseListData.js';
var parseListDataCardinality = require('../../parse_data/parseListDataCardinality.js');
var parseBucketData = require('../../parse_data/parseBucketData.js');


class MicroanalysisCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            dashboardName: "microanalysis/charts",
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
        this.callBacks = {
            functors: [
              //parse data
              //TYPES
              {result: this.state.typesCount, func: parseBucketData.parse},

              //FROM UA
              {result: this.state.fromUA, func: parseListData},

              //SIP METHOD
              {result: this.state.sipMethod, func: parseListData},

              //SIP CODE
              {result: this.state.sipCode, func: parseListData},

              //TOP SUBNETS
              {result: this.state.topSubnets, func: parseListData},

              //r-URI PREFIX STRIPPED
              {result: this.state.prefixStripped, func: parseListData},

              //SOURCE IP ADDRESS
              {result: this.state.sourceIP, func: parseListData},

              //TOP 10 FROM
              {result: this.state.top10from, func: parseListData},

              //CALLER DOMAIN
              {result: this.state.callerDomain, func: parseListData},

              //TOP 10 TO
              {result: this.state.top10to, func: parseListData},

              //DOMAIN STATS
              {result: this.state.distinctDestinations, func: parseListDataCardinality.parse},

              //TOP CALL ATTEMPTS
              {result: this.state.topCallAttempts, func: parseListData},

              //TOP CALL ENDS
              {result: this.state.topCallEnds, func: parseListData},

              //DESTINATION BY R-URI
              {result: this.state.destination, func: parseListData},

              //SUM DURATION
              {result: this.state.sumDuration, func: parseListDataCardinality},

              //TOP DURATION
              {result: this.state.topDuration, func: parseListDataCardinality},

              //TOP DURATION < 5 sec
              {result: this.state.topDuration5, func: parseListData},

              //TOP SBCs
              {result: this.state.topSBC, func: parseListData},

              //SRC CA
              {result: this.state.srcCA, func: parseListData},

              //DST CA
              {result: this.state.dstCA, func: parseListData},

              //ORIGINATOR
              {result: this.state.originator, func: parseListData}
            ]
        }
    }

    //render GUI
    render() {
        return (<
            div > {
                this.state.isLoading && < LoadingScreenCharts />
            }

            <
            div className="row no-gutters" >
                <
            div className="col" >
                    <
                        DonutChart data={
                            this.state.typesCount
                        }
                        units={"count"}
                        name={
                            "TYPES"
                        }
                        id="types"
                        width={
                            store.getState().width / 2 - 150
                        }
                        legendSize={
                            50
                        }
                        height={
                            200
                        }
                        field="attrs.type" />
                    <
            /div> <
            div className="col" >
                        <
                            ListChart data={
                                this.state.fromUA
                            }
                            name={
                                "FROM UA"
                            }
                            field={
                                "attrs.from-ua"
                            }
                        />   < /
            div > <
            /div> <
            div className="row no-gutters" >
                            <
            div className="col" >
                                <
                                    ListChart data={
                                        this.state.sipMethod
                                    }
                                    name={
                                        "SIP METHOD"
                                    }
                                    field={
                                        "attrs.method"
                                    }
                                />  < /
            div > <
            div className="col" >
                                    <
                                        ListChart data={
                                            this.state.sipCode
                                        }
                                        name={
                                            "SIP CODE"
                                        }
                                        field={
                                            "attrs.sip-code"
                                        }
                                    />  < /
            div > <
            div className="col" >
                                        <
                                            ListChart data={
                                                this.state.topSubnets
                                            }
                                            name={
                                                "TOP SUBNETS /24"
                                            }
                                            field={
                                                "attrs.sourceSubnets"
                                            }
                                        />  < /
            div > <
            div className="col" >
                                            <
                                                ListChart data={
                                                    this.state.prefixStripped
                                                }
                                                name={
                                                    "r-URI"
                                                }
                                                field={
                                                    "attrs.r-uri-shorted"
                                                }
                                            />  < /
            div > <
            div className="col" >
                                                <
                                                    ListChart data={
                                                        this.state.sourceIP
                                                    }
                                                    name={
                                                        "SOURCE IP ADDRESS"
                                                    }
                                                    field={
                                                        "attrs.source"
                                                    }
                                                />  < /
            div > <
            div className="col" >
                                                    <
                                                        ListChart data={
                                                            this.state.srcCA
                                                        }
                                                        name={
                                                            "SRC CA"
                                                        }
                                                        field={
                                                            "attrs.src_ca_name"
                                                        }
                                                    />  < /
            div > <
            div className="col" >
                                                        <
                                                            ListChart data={
                                                                this.state.dstCA
                                                            }
                                                            name={
                                                                "DST CA"
                                                            }
                                                            field={
                                                                "attrs.dst_ca_name"
                                                            }
                                                        />  < /
            div > <
            div className="col" >
                                                            <
                                                                ListChart data={
                                                                    this.state.originator
                                                                }
                                                                name={
                                                                    "ORIGINATOR"
                                                                }
                                                                field={
                                                                    "attrs.originator"
                                                                }
                                                            />  < /
            div > <
            div className="col" >
                                                                <
                                                                    ListChart data={
                                                                        this.state.top10from
                                                                    }
                                                                    name={
                                                                        "TOP 10 FROM"
                                                                    }
                                                                    field={
                                                                        "attrs.from.keyword"
                                                                    }
                                                                />  < /
            div > <
            div className="col" >
                                                                    <
                                                                        ListChart data={
                                                                            this.state.callerDomain
                                                                        }
                                                                        name={
                                                                            "CALLER DOMAIN"
                                                                        }
                                                                        field={
                                                                            "attrs.from-domain"
                                                                        }
                                                                    />  < /
            div > <
            div className="col" >
                                                                        <
                                                                            ListChart data={
                                                                                this.state.top10to
                                                                            }
                                                                            name={
                                                                                "TOP 10 TO"
                                                                            }
                                                                            field={
                                                                                "attrs.to.keyword"
                                                                            }
                                                                        />  < /
            div > <
            div className="col" >
                                                                            <
                                                                                ListChart data={
                                                                                    this.state.distinctDestinations
                                                                                }
                                                                                name={
                                                                                    "DISTINCT DESTINATIONS"
                                                                                }
                                                                                field={
                                                                                    "attrs.from.keyword"
                                                                                }
                                                                            />  < /
            div >

            <
            div className="col" >
                                                                                <
                                                                                    ListChart data={
                                                                                        this.state.topCallAttempts
                                                                                    }
                                                                                    name={
                                                                                        "TOP CALL ATTEMPTS"
                                                                                    }
                                                                                    field={
                                                                                        "attrs.from.keyword"
                                                                                    }
                                                                                />  < /
            div > <
            div className="col" >
                                                                                    <
                                                                                        ListChart data={
                                                                                            this.state.topCallEnds
                                                                                        }
                                                                                        name={
                                                                                            "TOP CALL ENDS"
                                                                                        }
                                                                                        field={
                                                                                            "attrs.from-keyword"
                                                                                        }
                                                                                    />  < /
            div > <
            div className="col" >
                                                                                        <
                                                                                            ListChart data={
                                                                                                this.state.destination
                                                                                            }
                                                                                            name={
                                                                                                "DESTINATION BY R-URI"
                                                                                            }
                                                                                            field={
                                                                                                "attrs.r-uri.keyword"
                                                                                            }
                                                                                        />  < /
            div > <
            div className="col" >
                                                                                            <
                                                                                                ListChart data={
                                                                                                    this.state.sumDuration
                                                                                                }
                                                                                                name={
                                                                                                    "SUM DURATION"
                                                                                                }
                                                                                                field={
                                                                                                    "attrs.from.keyword"
                                                                                                }
                                                                                            />  < /
            div > <
            div className="col" >
                                                                                                <
                                                                                                    ListChart data={
                                                                                                        this.state.topDuration
                                                                                                    }
                                                                                                    name={
                                                                                                        "TOP DURATION"
                                                                                                    }
                                                                                                    field={
                                                                                                        "attrs.from.keyword"
                                                                                                    }
                                                                                                />  < /
            div > <
            div className="col" >
                                                                                                    <
                                                                                                        ListChart data={
                                                                                                            this.state.topDuration5
                                                                                                        }
                                                                                                        name={
                                                                                                            "TOP DURATION < 5 sec"
                                                                                                        }
                                                                                                        field={
                                                                                                            "attrs.from.keyword"
                                                                                                        }
                                                                                                    />  < /
            div > <
            div className="col" >
                                                                                                        <
                                                                                                            ListChart data={
                                                                                                                this.state.topSBC
                                                                                                            }
                                                                                                            name={
                                                                                                                "TOP SBCs LIST"
                                                                                                            }
                                                                                                            field={
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
