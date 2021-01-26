import React, {
    Component
} from 'react';


import SecurityTable from './SecurityTable';
import SecurityCharts from './SecurityCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Security extends Component {
    constructor(props) {
        super(props);
        this.showError = this.showError.bind(this);
    }

    showError(value) {
        this.props.showError(value);
    }

    render() {
        return (
            <div className="container-fluid">
                <FilterBar tags={this.props.tags} />
                <TypeBar />
                <SecurityCharts showError={this.showError} />
                <SecurityTable tags={this.props.tags} />
            </div>

        );
    }
}

export default Security;
