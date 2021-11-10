import React, {
    Component
} from 'react';


import NetworkTable from './NetworkTable';
import NetworkCharts from './NetworkCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Network extends Component {
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
            <div className="container-fluid" style={{"paddingRight": "0"}}>
                <FilterBar />
                <TypeBar />
                <NetworkCharts showError={this.showError} hostnames={this.state.hostnames} />
                <NetworkTable />
            </div>

        );
    }
}

export default Network;
