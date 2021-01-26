import React, {
    Component
} from 'react';


import ConferenceTable from './ConferenceTable';
import ConferenceCharts from './ConferenceCharts';
import FilterBar from '../../bars/FilterBar';
import TypeBar from '../../bars/Typebar';

class Conference extends Component {
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
                <FilterBar  tags={this.props.tags}/>
                <TypeBar/>
                <ConferenceCharts  showError={this.showError} />
                <ConferenceTable   tags={this.props.tags} />
            </div>
                       
        );
    }
}

export default Conference;
