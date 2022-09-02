import React, {
    Component
} from 'react';


import MonitoringCharts from './MonitoringCharts';

class Monitoring extends Component {
    constructor(props) {
        super(props);    
    }
    
    render() {
        return (
            <div className="container">
                <MonitoringCharts />
            </div>
                       
        );
    }
}

export default Monitoring;
