//special case to dispatch more filters in once
export const createFilterNoDispatch=(searchValue, i)=>{
        //check if it contains colon
        var colonFirst = searchValue.indexOf(':');
        //check if it's avg MoS - bug round up value
        //attrs.rtp-MOScqex-avg: [3 TO 4] to search for 3.x
        if(searchValue.includes("rtp-MOScqex-avg")){
            var value = parseInt(searchValue.substr(colonFirst+1));
            searchValue =  [searchValue.substr(0, colonFirst+1), "[",value ," TO ", value+1, "]"].join(''); 
        }
   /* else if (colonFirst !== -1){
    searchValue =  [searchValue.substr(0, colonFirst+1), '"',value ,'"', value+1].join('');
    }*/
            var joined = {
                id:i, 
                title:searchValue, 
                state: 'enable',
                pinned: 'true'
            };
            return joined;
}