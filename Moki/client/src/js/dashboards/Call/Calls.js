import React, {
    Component
} from 'react';


import CallsTable from './CallsTable';
import CallCharts from './CallCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Calls extends Component {
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
                <FilterBar tags={this.props.tags}/>
                <TypeBar/>
                <CallCharts  showError={this.showError} />
                <CallsTable  tags={this.props.tags} />
            </div>
                       
        );
    }
}

export default Calls;
