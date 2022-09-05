import React, {
    Component
} from 'react';
import MicroanalysisCharts from './MicroanalysisCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Microanalysis extends Component {
    constructor(props) {
        super(props);
    }
        
    render() {
        return (
            <div className="container-fluid" style={{"paddingRight": "0"}}>
            <FilterBar tags={this.props.tags} /> 
            <TypeBar/>
                <MicroanalysisCharts />
            </div>
     
        );
    }
}

export default Microanalysis;
