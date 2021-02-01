import React, {
    Component
} from 'react';
import colorType from '../helpers/style/ColorType';

class Type extends Component{
constructor(props) {
   super(props);
        this.state = {
            state: 'enable',
            color: colorType[this.props.id],
        }
        this.disableType = this.disableType.bind(this);

    }
    
    componentWillReceiveProps(nextProps) {
   // if (nextProps.state !== this.props.state) {
         if(nextProps.state === "disable"){
            this.setState({state: 'disable'}); 
            this.setState({color: 'gray'}); 

        }else{
            this.setState({state: 'enable'}); 
            this.setState({color: colorType[this.props.id]}); 
   //        }
    }
  }

    
    disableType(events){
        if(this.state.state === "enable"){
            this.setState({state: 'disable'}); 
            this.setState({color: 'gray'}); 
            this.props.disableType(events.currentTarget.getAttribute('id'));

        }else{
            this.setState({state: 'enable'}); 
            this.setState({color: colorType[this.props.id]}); 
            this.props.enableType(events.currentTarget.getAttribute('id'));
           }
       
    }
    
    render(){    
        return(
                <button type="button" className="type" id={this.props.id} state={this.state.state}  style={{backgroundColor: this.state.color}} onClick={this.disableType}>{this.props.name} 
            </button>             
        )
        };
    }
    
export default Type;