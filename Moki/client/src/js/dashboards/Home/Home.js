import React, {
    Component
} from 'react';
import HomeCharts from './HomeCharts';
import FilterBar from '../../bars/FilterBar';

class Home extends Component {
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
                <HomeCharts  showError={this.showError}/>
            </div>
     
        );
    }
}

export default Home;
