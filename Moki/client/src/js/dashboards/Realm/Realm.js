import React, {
    Component
} from 'react';


import RealmTable from './RealmTable';
import RealmCharts from './RealmCharts';
import FilterBar from '../../bars/FilterBar';

class Realm extends Component {
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
                <RealmCharts  showError={this.showError} hostnames={this.state.hostnames} />
                <RealmTable tags={this.props.tags} />
            </div>
                       
        );
    }
}

export default Realm;
