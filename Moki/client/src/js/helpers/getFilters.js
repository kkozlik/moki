import store from "../store/index";

export const getFilters=()=>{
        var filters = store.getState().filters;
        var filtersResult = [];
        for(var i =0; i < filters.length; i++) {
            console.log(filters[i].state);
            if(filters[i].state !== 'disable'){
               filtersResult.push(filters[i]);
               }
        }

        return filtersResult;
}