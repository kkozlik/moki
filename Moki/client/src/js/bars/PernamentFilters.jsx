import React, {
    Component
} from 'react';
import { setPernamentFilters } from "../actions/index";
import store from "../store/index";

//pernament filters for dashboard. 
//Dashboard_name: list
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
        if (this.state[event.currentTarget.getAttribute('id')] === false) {
            this.setState({
                [event.currentTarget.getAttribute('id')]: true
            })
            //remove from store
            for (var i = 0; i < oldPernamentFilters.length; i++) {
                if (oldPernamentFilters[i].id === event.currentTarget.getAttribute('id')) {
                    oldPernamentFilters.splice(i, 1);
                }
            }
        }
        //disable
        else {
            this.setState({
                [event.currentTarget.getAttribute('id')]: false
            })

            oldPernamentFilters.push({ "id": event.currentTarget.getAttribute('id'), "title": "NOT "+event.currentTarget.getAttribute('filter'), "state": "enable" });
        }
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
                                name={par.id}
                                title={par.filter}
                                className="filterPernament"
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
