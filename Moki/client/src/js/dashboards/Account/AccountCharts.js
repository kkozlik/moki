/*
Class to get data for all charts iin Call dashboard
*/
import React from 'react';
import Dashboard from '../Dashboard.js';
import TimedateStackedChart from '../../charts/timedate_stackedbar.js';
import ListChartPagination from '../../charts/list_chart_pagination.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import store from "../../store/index";
import { parseListDataCardinality, parseStackedbarTimeData, parseTls } from '@moki-client/es-response-parser';

class AccountCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);

        this.state = {
            dashboardName: "account/charts",
            eventRegsTimeline: [],
            accounting: [],
            tls_cn: [],
            isLoading: true
        }
        this.callBacks = {
            functors: [
                //eventRegsTimeline 0
                [{ result: 'eventRegsTimeline', func: parseStackedbarTimeData }],
                //accounting list 1
                [{ result: 'accounting', func: parseListDataCardinality }],
                 //tls-cn list 2
                 [{ result: 'tls_cn', func: parseTls }]
            ]
        };
    }


    //render GUI
    render() {
        return (<div> {
            this.state.isLoading && < LoadingScreenCharts />
        } <div className="row no-gutters" >
                <TimedateStackedChart id="eventsOverTime"
                    data={
                        this.state.eventRegsTimeline
                    }
                    units={"count"}
                    name={
                        "EVENTS OVER TIME"
                    }
                    keys={
                        this.state.tls_cn
                    }
                    width={store.getState().width - 300}

                />  </div>
            <div className="row no-gutters" >
                <div className="col">
                    <ListChartPagination data={
                        this.state.accounting
                    } name={"ACCOUNTING"} field={"tls-cn"} />
                </div>
            </div>
        </div>
        );
    }
}

export default AccountCharts;
