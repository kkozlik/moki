import React, {
    Component
} from 'react';


import MonitoringCharts from './MonitoringCharts';

class Monitoring extends Component {
    constructor(props) {
        super(props);    
        this.showError = this.showError.bind(this);
    }
    
     showError(value){
        this.props.showError(value);
    } 
    
    render() {
        return (
            <div className="container">
                <MonitoringCharts  showError={this.showError}/>
            </div>
                       
        );
    }
}

export default Monitoring;
