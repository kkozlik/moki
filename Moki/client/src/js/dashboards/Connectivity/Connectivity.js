import React, {
    Component
} from 'react';


import ConnectivityCharts from './ConnectivityCharts';
import TypeBar from '../../bars/Typebar';
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
           <div className="container-fluid">
                <FilterBar tags={this.props.tags} />
                <TypeBar/>
                <ConnectivityCharts  showError={this.showError} />
            </div>
                       
        );
    }
}

export default Connectivity;
