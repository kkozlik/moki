import React, {
    Component
} from 'react';
import DomainsCharts from './DomainsCharts';
import FilterBar from '../../bars/FilterBar';

class Domains extends Component {
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
                <DomainsCharts  showError={this.showError}/>
            </div>
     
        );
    }
}

export default Domains;
