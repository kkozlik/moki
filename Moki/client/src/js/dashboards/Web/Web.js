import React, {
    Component
} from 'react';


import WebCharts from './WebCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Web extends Component {
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
                            <TypeBar/>
                            <FilterBar tags={this.props.tags} />
                            <WebCharts  showError={this.showError}/>
            </div>
                       
        );
    }
}

export default Web;
