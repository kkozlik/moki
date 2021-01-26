import React, {
    Component
} from 'react';
import sortIcon from "../../styles/icons/sort.png";
import { createFilter } from "../helpers/createFilter";
import filter from "../../styles/icons/filter.png";
import unfilter from "../../styles/icons/unfilter.png";
import {
    durationFormat
} from "../helpers/durationFormat";

export default class multivalueChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data : "",
        }
        this.order = this.order.bind(this); 
    }
    
     componentWillReceiveProps(nextProps){
         if(this.props.data !== nextProps.data){
            this.setState({data: nextProps.data});           
         }
   }
    
    filter(event){ 
     createFilter(event.currentTarget.getAttribute('field') +":\""+event.currentTarget.getAttribute('value')+"\"");
}
    
    
unfilter(event){ 
     createFilter("NOT "+event.currentTarget.getAttribute('field') +":\""+event.currentTarget.getAttribute('value')+"\"");
}
    
    sortByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; 
            var y = b[key];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
    }
    
    order(event){
        var dataSorted = this.sortByKey(this.state.data, event.currentTarget.getAttribute('field'));
        this.setState({data: dataSorted});
    }
    
    render() {
        function niceNumber(nmb){
            if(nmb){
                return nmb.toLocaleString();
            }else {
                return 0;
            }
        }
        
      
        var data = this.state.data;
        var items = [];         
        for (var i = 0; i < data.length; i++) {
                items.push(<tr key={i}><td className="filterToggleActiveWhite">  <span className="filterToggle">            
                            <img onClick={this.filter} field={this.props.field} value={data[i].name} className="icon" alt="filterIcon" src={filter} />
                            <img field={this.props.field} value={data[i].name}  onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /> 
                            </span>
                           {data[i].name}
                           </td> 
                    <td className="filtertd" key={"value0"+i}> {niceNumber(data[i].value0)}</td>
                    <td className="filtertd" key={"value1"+i}>{durationFormat(data[i].value1)}</td>
                    <td className="filtertd" key={"value2"+i}>{niceNumber(data[i].value2)}</td>
                    <td className="filtertd" key={"value3"+i}>{niceNumber(data[i].value3)}</td>  
                    <td className="filtertd" key={"value4"+i}>{niceNumber(data[i].value4)}</td>  
                           </tr>
                    )
              }
        
        if(data.length === 0){
          items.push(<tr key={"key"}><td key={"value"}>-</td> 
                        <td className="filtertd" key={"value0"}>0</td>
                        <td className="filtertd" key={"value1"}>0</td>
                        <td className="filtertd" key={"value2"}>0</td>
                        <td className="filtertd" key={"value3"}>0</td>
                        <td className="filtertd" key={"value4"}>0</td>
                    </tr>
                    )
        }

        
        return (
            <div id = {this.props.id}>
                <h3 className="alignLeft title">{this.props.name}</h3>
            <table width="1000px">
                <tbody>
                <tr>
                    <th><h3>{this.props.name1}<img onClick={this.order} field="name" className="icon" alt="filterIcon" src={sortIcon} /></h3>
                    </th>
                    <th><h3>{this.props.name2}<img onClick={this.order} field="value0" className="icon" alt="filterIcon" src={sortIcon} /></h3></th>
                    <th><h3>{this.props.name3} <img onClick={this.order} field="value1" className="icon" alt="filterIcon" src={sortIcon} /></h3> </th>
                    <th><h3>{this.props.name4} <img onClick={this.order} field="value2" className="icon" alt="filterIcon" src={sortIcon} /></h3> </th>
                    <th><h3>{this.props.name5} <img onClick={this.order} field="value3" className="icon" alt="filterIcon" src={sortIcon} /></h3></th>
                     <th><h3>{this.props.name6} <img onClick={this.order} field="value4" className="icon" alt="filterIcon" src={sortIcon} /></h3></th>
                </tr>
                 {items}
            </tbody>
            </table>
            </div>
               )
    }
}


//<h4 className="alignLeft">{niceNumber(this.props.data[1])}</h4>