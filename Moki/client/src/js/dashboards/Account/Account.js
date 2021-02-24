import React, {
    Component
} from 'react';

import AccountCharts from './AccountCharts';
import FilterBar from '../../bars/FilterBar';

class Account extends Component {
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
                <AccountCharts showError={this.showError} />
            </div>

        );
    }
}

export default Account;
