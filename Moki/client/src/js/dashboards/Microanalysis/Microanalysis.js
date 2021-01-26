import React, {
    Component
} from 'react';
import MicroanalysisCharts from './MicroanalysisCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Microanalysis extends Component {
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
                <MicroanalysisCharts  showError={this.showError}/>
            </div>
     
        );
    }
}

export default Microanalysis;
