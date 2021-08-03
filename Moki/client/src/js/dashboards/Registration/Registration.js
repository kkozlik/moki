import React, {
    Component
} from 'react';


import RegistrationTable from './RegistrationTable';
import RegistrationCharts from './RegistrationCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Registration extends Component {
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
                            <RegistrationCharts  showError={this.showError}/>
                            <RegistrationTable tags={this.props.tags} />
            </div>
                       
        );
    }
}

export default Registration;
