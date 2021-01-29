/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';

import ListChartPagination from '../../charts/list_chart_pagination.js';
import store from "../../store/index";
import LoadingScreenCharts from '../../helpers/LoadingScreenCharts';
import { elasticsearchConnection } from '../../helpers/elasticsearchConnection';
import TableChart from '../../charts/table_chart.js';
import ValueChart from '../../charts/value_chart.js';
var parseListData = require('../../parse_data/parseListData.js');


class DomainsCharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            topDomains: [],
            table: [],
            countAll: [],
            total: 0,
            lastLogins: [],
            lastLoginsTotal: 0,
            isLoading: true
        }
        store.subscribe(() => this.loadData());
    }

    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state, callback) => {
            return;
        };
    }

    componentDidMount() {
        this.loadData();

    }
    /*
    Load data from elasticsearch
    get filters, types and timerange from GUI
    */
    async loadData() {

        this.setState({ isLoading: true });
        var data = await elasticsearchConnection("/domains/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {
            console.log(typeof data === "string" && data.includes("ERROR:"));

            this.props.showError(data);
            this.setState({ isLoading: false });
            return;

        } else if (data) {
            //parse data
            //top domains
            var topDomains = parseListData.parse(data.responses[0]);

            var table = data.responses[1];
            if (table && table.hits) {
                this.setState({
                    table: table.hits.hits,
                    total: table.hits.total.value
                });
            }
            //all count
            if (data.responses[2]) {
                var countAll = data.responses[2].hits.total.value;
            }

            var lastLogins = data.responses[3];
            if (lastLogins && lastLogins.hits) {
                this.setState({
                    lastLogins: lastLogins.hits.hits,
                    lastLoginsTotal: lastLogins.hits.total.value
                });
            }

            console.info(new Date() + " MOKI Domains: finished parsíng data");

            this.setState({
                countAll: countAll,
                topDomains: topDomains,
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
                        this.state.table
                    } total={this.state.total}
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
