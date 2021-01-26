import React, {
    Component
} from 'react';


import SystemTable from './SystemTable';
import SystemCharts from './SystemCharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class System extends Component {
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
                <FilterBar tags={this.props.tags} />
                <TypeBar/>
                <SystemCharts  showError={this.showError} hostnames={this.state.hostnames} />
                <SystemTable tags={this.props.tags}  />
            </div>
                       
        );
    }
}

export default System;
