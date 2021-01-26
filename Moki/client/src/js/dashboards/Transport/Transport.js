import React, {
    Component
} from 'react';


import TransportTable from './TransportTable';
import TransportCharts from './TransportCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';


class Transport extends Component {
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
                            <TransportCharts  showError={this.showError}/>
                            <TransportTable tags={this.props.tags}  />
            </div>
                       
        );
    }
}

export default Transport;
