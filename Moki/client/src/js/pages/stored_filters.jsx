import React, {
    Component
} from 'react';
import { createFilterNoDispatch } from "../helpers/createFilterNoDispatch";
import disableIcon from "../../styles/icons/disable.png";
import enableIcon from "../../styles/icons/enable.png";
import store from "../store/index";
import { setTimerange } from "../actions/index";
import { assignType } from "../actions/index";
import { setFilters } from "../actions/index";

class StoredFilters extends Component {
    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.activateFilter = this.activateFilter.bind(this);
        this.deleteFilter = this.deleteFilter.bind(this);
        this.state = {
            filters: []
        }
    }

    componentWillMount() {
        this.load();
    }

    /*
       Load data 
       */
    async load() {

        var Url = "api/filters";
        var jsonData;
        try {
            const response = await fetch(Url, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            jsonData =  await response.json();
            if(jsonData.general.m_filters){
                this.setState({
                    filters: jsonData.general.m_filters
                });
            }
            console.info("Got stored filters "+JSON.stringify(jsonData));
        } catch (error) {
            console.error(error);
            alert("Problem with receiving data. " + error);
        }

    }
   
    //redirect to dashboard stored in filters, active  stored types, filters and timerange
    activateFilter(event){         
       var filterID = event.currentTarget.getAttribute("filterid");
       var storedFilters =  this.state.filters;
       var filters = "";
        var newFilters = [];
        
        for(var i =0; i < storedFilters.length; i++){
            if(storedFilters[i].id === filterID)
               filters = storedFilters[i];
            }
        
        document.getElementsByClassName("close")[0].click();
        //redirect according to dashboard name
        var name = filters.attribute[1].name;
        document.getElementById(name).click();
        
        //filters
        if(filters.attribute[0].filters){
            for(i =0; i < filters.attribute[0].filters.length; i++){
                 newFilters.push(createFilterNoDispatch(filters.attribute[0].filters[i][0].title, i));
            }
            store.dispatch(setFilters(newFilters));
        }
        
        //types
        if(filters.attribute[2].types){
            store.dispatch(assignType(filters.attribute[2].types));
        }

        //timerange
         if(filters.attribute[3]){
             var timestamp_readiable = new Date(filters.attribute[3].timerange[0]).toLocaleString() + " - " + new Date(filters.attribute[3].timerange[1]).toLocaleString();
             store.dispatch(setTimerange( [filters.attribute[3].timerange[0], filters.attribute[3].timerange[1], timestamp_readiable]));
        }
    }

    
    async deleteFilter(event){
       
        var filter = event.currentTarget.getAttribute("id");  
         console.info("Delete filter "+filter)
        var filters =this.state.filters;
        filters = filters.filter(function( obj ) {
          return obj.id !== filter;
        }); 
        var Url = "api/filters/delete";
        try {
            const response = await fetch(Url, {
                method: "POST",
                body: JSON.stringify(filters),
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            var jsonData = await response.json();
            
            console.info("Filter deleted "+JSON.stringify(jsonData));
        } catch (error) {
            console.error(error);
            alert("Problem with deleting filter " + error);
        }
        
        //load new filters at the end
        this.load();
    }
    
    
    render() {    
        var filters =  this.state.filters;
 if(filters.length !== 0){
        return ( 
             <React.Fragment>
            {filters.map((item, key) =>
            <div className = "rowFilter" key={item.id} >
                    <span className = "iconsStoredFilter" onClick={this.activateFilter} filterid={item.id}>
                                    <img  style={{"width": "10px"}} alt = "activateIcon" src ={enableIcon} title = "activate filter"  />
                            </span >
                             <span className = "iconsStoredFilter iconsDelete" onClick={this.deleteFilter} id={item.id}>
                                    <img style={{"width": "10px"}} alt = "deleteIcon" src = {disableIcon} title = "delete filter" />
                            </span >
                            <b style={{"marginLeft": "20px"}}>{item.id}: </b>
                     {item.attribute[0].filters.length > 0 &&
                item.attribute[0].filters[0].map((subitem, i) => {
                    if(i <=3){
                      return (
                          <span className="tab" key={i}>{subitem.title}</span>
                      )
                    }
                    return "";
                })}
                             
                             
                </div>
            )}
        </React.Fragment>
        
    );}
    else {
     return <span>No stored filters </span>
     }
    }
}

export default StoredFilters;
