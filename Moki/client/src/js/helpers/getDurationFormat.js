/*
display duration in HH MM SS format
*/
export const formatDuration = (duration) => {
    var sec_num = duration;

    var days = Math.floor(sec_num / 86400) ? Math.floor(sec_num / 86400) + "d" : "";

    var hours = Math.floor(sec_num / 3600) ? Math.floor(sec_num / 3600) + "h" : "";

    var minutes = Math.floor((sec_num % 3600) / 60) ? Math.floor((sec_num % 3600) / 60) + "m" : "";

    var seconds = sec_num % 60 ? Math.round(sec_num % 60) + "s" : "";

    //don't  display seconds if value is in days
    if (days) {
        seconds = "";
    }

    //rounding up removed real value
    if (sec_num == 0) {
        return "less than 0.01 ms";
    }

    //if value is less than zero => less than second, show ms
    if (sec_num < 1) {
        return sec_num * 1000 + "ms";
    }

    //duration < 10 display format s:ms
    if (sec_num < 60) {
        var ms = "";
        if (sec_num % 1 !== 0) {
            ms = Math.round((sec_num % 1) * 100) * 10 + "ms"
        }
        return parseInt(sec_num, 10) + "s " + ms;
    }

    return days + " " + hours + " " + minutes + " " + seconds;
}




