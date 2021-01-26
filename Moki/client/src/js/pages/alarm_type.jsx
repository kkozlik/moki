import React, {
    Component
} from 'react';

class AlarmType extends Component{
constructor(props) {
   super(props);
        this.state = {
            state: 'enable',
            color: 'black'
        }
        this.disableType = this.disableType.bind(this);

    }
        
    disableType(events){
        if(this.state.state === "enable"){
            this.setState({state: 'disable'}); 
            this.setState({color: 'grey'}); 

        }else{
            this.setState({state: 'enable'}); 
            this.setState({color: 'black'}); 
           }
       
    }
    
    
    
    render(){ 
        var data = this.props.data;        
        return  "" 
        /* <span className="container" > {
                    data.map((row, index) => {
                    var oldLabel = data[index-1] ? data[index-1].name : "";
                            row.name === oldLabel ?
                                   {
                                       
                                      return   (  <Row id={row.id} key={row.id} value={row.value} label={row.label} type={row.type}/>
                                       )

                                   }
                                : {
                               
                                    return (<span>
                                        <input  type="checkbox" onClick={this.disableType} id={row.id}></input> <b style={{color: this.state.color}} >{row.label}</b>
                                    </span>)
                                    
                                }

                            })
                        } </span>
                        */
                    
            }
    }

export default AlarmType;


class Row extends React.Component {
  render() {
    return (
        <span className="row">
            <label className="col-4" id={this.prosps.id} key={this.prosps.id} value={this.prosps.value}> {this.prosps.label}</label>
            <input className="col" type={this.prosps.type}  id ={this.prosps.id} value={this.prosps.value}/>
        </span>
    )
    
    }
}