import {getTypes} from "./getTypes.js";
import {getFilters} from "./getFilters.js";
import store from "../store/index";

export async function elasticsearchConnection(query){
    var pathname = window.location.pathname;
    pathname = pathname.substr(1);
    if(query.includes(pathname)){
            console.info("MOKI: send fetch: "+query);        
            console.info("MOKI: send fetch with filters: "+JSON.stringify(getFilters()));
            console.info("MOKI: send fetch with types: "+JSON.stringify(getTypes()));
            console.info("MOKI: send fetch with timerange: " + store.getState().timerange[0] + " - " +store.getState().timerange[1]); 
            console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
            var data; 
            var response;
            try{
               response = await fetch("/api/"+query, {
                        method: "POST",
                        timeout: 10000,
                        credentials: 'include',
                        body: JSON.stringify({
                        filters: getFilters(),
                        types: getTypes(),
                        timerange_gte: store.getState().timerange[0],
                        timerange_lte: store.getState().timerange[1],
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      }),
                       headers: {"Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"}
                    });
                }
                catch (error) {
                    return "ERROR: "+error;
                }

                if (!response.ok) {
                   // response
                   var error = await response.json();
                   if(error.error){
                    return "ERROR: Problem to connect to ES: "+error.error;
                   }
                   else {
                    return "ERROR: Problem with ES: "+JSON.stringify(error);

                   }
                  }
                data = await response.json();
                console.info(new Date() + " MOKI: got elastic data");     
                
                //my own error 
                if(data.msg){
                   //  store.dispatch(setError(data.msg.message));

                   return "ERROR: "+data.msg; 
                }
                return data;
    }
    //return "";
}

