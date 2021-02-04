/*
Base class for all dashboards
*/
import React, {
    Component
} from 'react';

import store from "../store/index";
import {elasticsearchConnection} from '../helpers/elasticsearchConnection';

class Dashboard extends Component {

  // Initialize the state
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.state = { };
    this.callBacks = { functors: [] }
    store.subscribe(() => this.loadData());
  }
    
    
  componentDidMount() {
    this.loadData();
  }


  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state,callback)=>{
        return;
    };
  }

  processESData(data) {
    if((!data) || (!data.responses)) {
      return;
    }
    for(let i=0; (i<data.responses.length) && (i<this.callBacks.functors.length); i++) {
      this.state[this.callBacks.functors[i].result] = this.callBacks.functors[i].func(data.responses[i]);
    }
  }
  
  async loadData() {
    
    this.setState({isLoading: true}); 
        
    var data = await elasticsearchConnection(this.state.dashboardName);

    if(typeof data === "string" && data.includes("ERROR:")){
    
      this.props.showError(data);
      this.setState({isLoading: false});
      return; 
        
    }else if(data){
      this.processESData(data);
      this.setState(this.state);  
      this.setState({isLoading: false}); 
      console.info(new Date() + " MOKI CALLS: finished parsíng data");
   
    }
  }

}

export default Dashboard;
