import React, {
    Component
} from 'react';


import DiagnosticsTable from './DiagnosticsTable';
import DiagnosticsCharts from './DiagnosticsCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';


class Diagnostics extends Component {
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
                            <DiagnosticsCharts showError={this.showError} />
                            <DiagnosticsTable tags={this.props.tags}  />
            </div>
                       
        );
    }
}

export default Diagnostics;
