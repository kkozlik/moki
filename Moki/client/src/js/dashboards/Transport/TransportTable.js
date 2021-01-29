import React, {
    Component
} from 'react';


import TableChart from '../../charts/table_chart.js';
import store from "../../store/index";
import {
    elasticsearchConnection
} from '../../helpers/elasticsearchConnection';

class TransportTable extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.state = {
            registrations: [],
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
        var calls = await elasticsearchConnection("/transport/table");
        if (calls === undefined || !calls.hits || !calls.hits.hits || (typeof calls === "string" && calls.includes("ERROR:"))) {

            return;
        } else if (calls) {
            var data = calls.hits.hits;
            var total = calls.hits.total.value;
            this.setState({
                registrations: data,
                total: total
            });
        }
    }

    render() {
        return (
            <
            div className="row no-gutters" >
                <
                    TableChart data={
                        this.state.registrations
                    } total={this.state.total}
                    name={
                        "transport"
                    }
                    id={
                        "TRANSPORT EVENTS"
                    }
                    width={
                        store.getState().width - 300
                    }
                    tags={this.props.tags}
                />  < /
            div > 
        );
    }
}

export default TransportTable;
