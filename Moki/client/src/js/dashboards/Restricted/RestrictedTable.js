import React, {
    Component
} from 'react';


import TableChart from '../../charts/table_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';

import {parseTableHits} from '@moki-client/es-response-parser';

class RestrictedTable extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            calls: [],
            total: 0
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

    async loadData() {

        var calls = await elasticsearchConnection("restricted/calls");
        if ((calls === undefined) || !calls.hits || !calls.hits.hits || (typeof calls === "string" && calls.includes("ERROR:"))) {

            return;
        } else if (calls) {

            var data = parseTableHits(calls.hits.hits);
            var total = calls.hits.total.value;
            this.setState({
                calls: data,
                total: total
            });
        }
    }



    render() {
        return (
            <div className="row no-gutters" >
                <TableChart data={
                    this.state.calls
                } total={this.state.total}
                    name={
                        "homeLoginCalls"
                    }
                    id={
                        "CALL EVENTS"
                    }
                    loadData={
                        this.update
                    }
                    tags={this.props.tags}
                />  </div>
        );
    }
}

export default RestrictedTable;
