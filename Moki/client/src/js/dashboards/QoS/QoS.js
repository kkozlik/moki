import React, {
    Component
} from 'react';


import QoSTable from './QoSTable';
import QoSCharts from './QoSCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';


class QoS extends Component {
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
                            <QoSCharts showError={this.showError} />
                            <QoSTable tags={this.props.tags}  />
            </div>
                       
        );
    }
}

export default QoS;
