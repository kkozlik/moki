import React, {
    Component
} from 'react';
import store from "../store/index";

class Popup extends Component{   
    render(){
        return(
               <div className="row align-items-center justify-content-center overlay" style={{left: store.getState().width === 1200 ? "245px" : "75px"}}>
                    {this.props.data}
                </div>        
        )
        }
    }
    
export default Popup;