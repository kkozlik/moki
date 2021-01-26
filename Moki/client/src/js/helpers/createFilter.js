import store from "../store/index";
import { setFilters } from "../actions/index";

export const createFilter=(searchValue)=>{
        //check if it contains colon
        var colonFirst = searchValue.indexOf(':');
        //check if it's avg MoS - bug round up value
        //attrs.rtp-MOScqex-avg: [3 TO 4] to search for 3.x
        if(searchValue.includes("rtp-MOScqex-avg")){
            var value = parseInt(searchValue.substr(colonFirst+1));
            searchValue =  [searchValue.substr(0, colonFirst+1), "[",value ," TO ", value+1, "]"].join(''); 
        }

                //generate id of filter
            var id = store.getState().filters.length > 0? store.getState().filters[store.getState().filters.length-1].id+1 : 1; 
            var joined = store.getState().filters.concat({
                id:id, 
                title:searchValue, 
                state: 'enable',
                pinned: 'true'
            });
            store.dispatch(setFilters(joined));
            return joined;
}