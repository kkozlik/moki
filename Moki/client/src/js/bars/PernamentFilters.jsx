import React, {
    Component
} from 'react';
import { setPernamentFilters } from "../actions/index";
import store from "../store/index";

const pernamentFilters = {
    alerts: [
        {
            id: 0,
            name: "high",
            filter: "severity: 0",
            color: "red"
        },
        {
            id: 1,
            name: "medium",
            filter: "severity: 1",
            color: "orange"
        },
        {
            id: 2,
            name: "low",
            filter: "severity: 2",
            color: "green"
        }
    ]
};

class PernamentFilters extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.activateFilter = this.activateFilter.bind(this);
    }

    activateFilter(event) {
        var oldPernamentFilters = JSON.parse(JSON.stringify(store.getState().pernamentFilters));
        //enable
        if (this.state[event.currentTarget.getAttribute('id')]) {
            this.setState({
                [event.currentTarget.getAttribute('id')]: true
            })
            //remove from store
            for (let filter of oldPernamentFilters) {
                if (filter.id === event.currentTarget.getAttribute('id')) {
                    oldPernamentFilters.splice(filter.id, 1);
                }
            }
        }
        //disable
        else {
            this.setState({
                [event.currentTarget.getAttribute('id')]: false
            })

            oldPernamentFilters.push({ "id": event.currentTarget.getAttribute('id'), "title": event.currentTarget.getAttribute('filter'), "state": "enable" });
        }

        console.log("-----");
        console.log(oldPernamentFilters);
        store.dispatch(setPernamentFilters(oldPernamentFilters));
    }

    render() {
        return (
            <div className="row" style={{ "marginLeft": "8px" }}>
                <div className="filterBar" id="filterBarPernament">
                    {pernamentFilters[this.props.dashboard] && pernamentFilters[this.props.dashboard].map((par, i) => {
                        return (<span className="filterBody">
                            <button style={{ backgroundColor: this.state[par.id] === false ? "grey" : par.color }}
                                type="button"
                                className="filter"
                                filter={par.filter}
                                onClick={this.activateFilter}
                                id={par.id} > {
                                    par.name.toUpperCase()
                                }</button>
                        </span>
                        )
                    })}
                </div>
            </div>
        )
    }
}
export default PernamentFilters;
