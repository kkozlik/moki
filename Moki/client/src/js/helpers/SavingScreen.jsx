import React, {
    Component
} from 'react';

class SavingScreen extends Component{   
    render(){
        return(
               <div className="row align-items-center justify-content-center overlay" style={{left: 0}}>
                    <div className="loaderSmall"/>
                    <h2 style={{"marginLeft": "10px"}} >Saving data...</h2>
                </div>        
        )
        }
    }
    
export default SavingScreen;