/*
Class to get data for all charts iin Call dashboard
*/

import React from 'react';
import Dashboard from '../Dashboard.js';
import ListChartPagination from '../../charts/list_chart_pagination.js';
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import TableChart from '../../charts/table_chart.js';
import ValueChart from '../../charts/value_chart.js';
import {parseListData, parseHits, parseHitsTotal} from 'es-response-parser';


class DomainsCharts extends Dashboard {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            dashboardName: "/domains/charts",
            topDomains: [],
            domainsTable: [],
            domainsTableTotal: 0,
            countAll: [],
            lastLogins: [],
            lastLoginsTotal: 0,
            isLoading: true
        };
        this.callBacks = {
            functors: [
              //top domains
              [{result: 'topDomains', func: parseListData}],
              //domainsTable, domainsTableTotal
              [{result: 'domainsTable', func: parseHits}, {result: 'domainsTableTotal', func: parseHitsTotal}],
              [{result: 'countAll', func: parseHitsTotal}],
              [{result: 'lastLogins', func: parseHits}, {result: 'lastLoginsTotal', func: parseHitsTotal}],
            ]
        };
    }

    //render GUI
    render() {
        return (
            <div>
                { this.state.isLoading && <LoadingScreenCharts />}
                <div className="row no-gutters">
                    <div className="col">
                        <ValueChart data={
                            this.state.countAll
                        } name={"COUNT ALL"} />
                    </div>
                    <div className="col">
                        <ListChartPagination data={
                            this.state.topDomains
                        } name={"DOMAINS"} field={"tls-cn"} />
                    </div>
                </div>
                <div className="row no-gutters">
                    <TableChart tags={this.props.tags} data={
                        this.state.domainsTable
                    } total={this.state.domainsTableTotal}
                        name={
                            "domains"
                        }
                        id={
                            "DOMAINS EVENTS"
                        }
                    />
                </div>
                <div className="row no-gutters">
                    <TableChart tags={this.props.tags} data={
                        this.state.lastLogins
                    } total={this.state.lastLoginsTotal}
                        name={
                            "logins"
                        }
                        id={
                            "LAST LOGIN EVENTS"
                        }
                    />
                </div>
            </div>
        );
    }
}

export default DomainsCharts;
