import React, {
    Component
} from 'react';


import ConnectivityCharts from './ConnectivityCharts';
import FilterBar from '../../bars/FilterBar';

class Connectivity extends Component {
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
                <ConnectivityCharts  showError={this.showError} />
            </div>
                       
        );
    }
}

export default Connectivity;
