import React, {
    Component
} from 'react';


import ConnectivityCACharts from './ConnectivityCACharts';
import TypeBar from '../../bars/Typebar';
import FilterBar from '../../bars/FilterBar';

class ConnectivityCA extends Component {
    constructor(props) {
        super(props);  
        this.state = {
            srcRealms: this.props.srcRealms,
            dstRealms: this.props.dstRealms
          }
        this.showError = this.showError.bind(this);
    }
    
    showError(value){
        this.props.showError(value);
    } 
    
     componentWillReceiveProps(nextProps){
      if(nextProps.dstRealms !==  this.props.dstRealms){
        this.setState({dstRealms: nextProps.dstRealms });
      }
      if(nextProps.srcRealms !==  this.props.srcRealms){
        this.setState({srcRealms: nextProps.srcRealms });
      }
    }
      
    render() {
        return (
           <div className="container-fluid">
                <FilterBar tags={this.props.tags}  srcRealms={this.state.srcRealms} dstRealms={this.state.dstRealms}/>
                <TypeBar/>
                <ConnectivityCACharts  showError={this.showError}/>
            </div>
                       
        );
    }
}

export default ConnectivityCA;
