/*
display duration in HH MM SS format
*/
export const formatDuration = (duration) =>  {
        var sec_num = parseInt(duration, 10);

        var days = Math.floor(sec_num / 86400) ? Math.floor(sec_num / 86400) + "d" : "";

        var hours = Math.floor(sec_num / 3600) ? Math.floor(sec_num / 3600) + "h" : "";

        var minutes = Math.floor((sec_num % 3600) / 60) ? Math.floor((sec_num % 3600) / 60) + "m" : "";

        var seconds = sec_num % 60 ? sec_num % 60 + "s" : "";

        //don't  display seconds if value is in days
        if (days) {
            seconds = "";
        }


        return days + " " + hours + " " + minutes + " " + seconds;
    }




