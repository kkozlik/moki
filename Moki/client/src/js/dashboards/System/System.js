import React, {
    Component
} from 'react';


import SystemTable from './SystemTable';
import SystemCharts from './SystemCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class System extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hostnames: this.props.hostnames
        }
        this.showError = this.showError.bind(this);
    }

    showError(value) {
        this.props.showError(value);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.hostnames !== prevState.hostnames) {
            return { hostnames: nextProps.hostnames };
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.hostnames !== this.props.hostnames) {
            this.setState({ hostnames: this.props.hostnames });
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <FilterBar tags={this.props.tags} />
                <TypeBar />
                <SystemCharts showError={this.showError} hostnames={this.state.hostnames} />
                <SystemTable tags={this.props.tags} />
            </div>

        );
    }
}

export default System;
