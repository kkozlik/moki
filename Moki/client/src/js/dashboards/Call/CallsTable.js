import React, {
    Component
} from 'react';


import TableChart from '../../charts/table_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';
import {parseTableHits} from 'es-response-parser';

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

componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state,callback)=>{
        return;
    };
}



    async loadData() {
        var calls = await elasticsearchConnection("calls/table");

        if (calls === undefined || !calls.hits || !calls.hits.hits ||(typeof calls === "string" && calls.includes("ERROR:"))) {

            return;
        } else if(calls) {
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
