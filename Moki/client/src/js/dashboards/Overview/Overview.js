import React, {
    Component
} from 'react';


import OverviewTable from './OverviewTable';
import OverviewCharts from './OverviewCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Overview extends Component {
    constructor(props) {
        super(props);
        this.showError = this.showError.bind(this);

    }

    showError(value){
         this.props.showError(value);
    }

   
    render() {
        return (
            <div className="container-fluid" style={{"paddingRight": "0"}}>
                    <FilterBar tags={this.props.tags} />
                    <TypeBar/>
                    <OverviewCharts showError={this.showError} />
                    <OverviewTable tags={this.props.tags}  />
            </div>
                       
        );
    }
}

export default Overview;
