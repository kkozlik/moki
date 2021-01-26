import React, {
    Component
} from 'react';


import NetworkTable from './NetworkTable';
import NetworkCharts from './NetworkCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class Network extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hostnames: this.props.hostnames
          }
        this.showError = this.showError.bind(this);
    }
    
    showError(value){
        this.props.showError(value);
    } 
    
      componentWillReceiveProps(nextProps){
      if(nextProps.hostnames !==  this.props.hostnames){
        this.setState({hostnames: nextProps.hostnames });
      }
    }
      
    render() {
        return (
           <div className="container-fluid">
                <FilterBar/>
                <TypeBar/>
                <NetworkCharts  showError={this.showError} hostnames={this.state.hostnames} />
                <NetworkTable   />
            </div>
                       
        );
    }
}

export default Network;
