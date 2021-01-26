 export const durationFormat=(nmb)=>{
     var sec_num = parseInt(nmb, 10);

     var days = Math.floor(sec_num / 86400) ? Math.floor(sec_num / 86400) + "d" : "";
     sec_num = sec_num - (Math.floor(sec_num / 86400) * 86400);

     var hours = Math.floor(sec_num / 3600) ? Math.floor(sec_num / 3600) + "h" : "";
     sec_num = sec_num - (Math.floor(sec_num / 3600) * 3600);

     var minutes = Math.floor((sec_num % 3600) / 60) ? Math.floor((sec_num % 3600) / 60) + "m" : "";
     sec_num = sec_num - (Math.floor((sec_num % 3600) / 60) * 60);

     var seconds = sec_num % 60 ? sec_num % 60 + "s" : "";

     //don't  display seconds if value is in days
     if (days) {
         seconds = "";
     }

     if (!days && !hours && !minutes && !seconds) return "0s";
     return days + " " + hours + " " + minutes + " " + seconds;
 }
