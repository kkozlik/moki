//returns timestamp bucket according to timestamp range to scale charts
export const timestampBucket = (timestamp_gte, timestamp_lte)=>{
         //+500 is round up
    //timestamp < 15 min, bucket 15s
   if(timestamp_lte - timestamp_gte <= (15*60*1000+500) ){
     return "%H:%M:%S";
   }
    //timestamp < 1 hour, bucket 1min
   else if(timestamp_lte - timestamp_gte <= (60*60*1000+500) ){
    return "%H:%M %p";
   }    
    //timestamp < 6 hour, bucket 5min
    else if(timestamp_lte - timestamp_gte <= (6*60*60*1000+500) ){
    return "%H:%M %p";
   }
    //timestamp < 12 hour, bucket 10min
    else if(timestamp_lte - timestamp_gte <= (12*60*60*1000+500) ){
    return "%H:%M %p";
   }
    //timestamp < 1 day, bucket 30min
    else if(timestamp_lte - timestamp_gte <= (24*60*60*1000+500) ){
    return "%d %b %H:%M %p";
   }
    //timestamp < 3 day, bucket 1 hour
    else if(timestamp_lte - timestamp_gte <= (72*60*60*1000+500) ){
    return "%d %b %H %p";
   }
    //timestamp < 7 day, bucket 3 hours
    else if(timestamp_lte - timestamp_gte <= (168*60*60*1000+500) ){
    return"%d %b %H %p";
   }
    //timestamp > 30 day, bucket 12 hours
    else {
    return "%d %b";
   }

}
