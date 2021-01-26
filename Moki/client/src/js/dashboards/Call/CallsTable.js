import React, {
    Component
} from 'react';


import TableChart from '../../charts/table_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';

class CallsTable extends Component {

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

componentDidMount() {
     this.loadData();
}


    async loadData() {
        var calls = await elasticsearchConnection("calls/table");

        if (calls === undefined || !calls.hits || !calls.hits.hits ||(typeof calls === "string" && calls.includes("ERROR:"))) {

            return;
        } else if(calls) {
            var data = calls.hits.hits;
            var total = calls.hits.total.value;
            this.setState({
                calls: data,
                total: total
            });
        }

    }


    render() {
        return (
            <div className = "row no-gutters" >
            <TableChart tags={this.props.tags} data = {
                this.state.calls
            } total={this.state.total}
            name = {
                "calls"
            }
            id = {
                "CALL EVENTS"
            }
            />  </div >
        );
    }
}

export default CallsTable;
