import storePersistent from "../store/indexPersistent";
import moment from 'moment-timezone';

export const parseTimestamp = (timestamp, ms = false) => {

        
        var format = getTimeSetings(ms);

        if (format === "") {
                return moment.utc(timestamp);
        }
       /* else if (Array.isArray(format)) {
                console.log("oooooooooooooooo");
                console.log(timestamp);
                console.log(format[1]);
                console.log(moment.tz(timestamp, format[1]).format(format[0]));
                return moment.tz(timestamp, format[1]).format(format[0]);
        }*/
        else {
                return moment.utc(timestamp).format(format);
        }

}

function getTimeSetings(ms) {
        var aws = storePersistent.getState().user.aws;
        //format is stored in json file
        if (aws !== true) {
                var timeFormat = "";
                var dateFormat = "";
                if (storePersistent.getState().settings && storePersistent.getState().settings.length > 0) {
                        for (var i = 0; i < storePersistent.getState().settings[0].attrs.length; i++) {
                                if (storePersistent.getState().settings[0].attrs[i].attribute === "timeFormat") {
                                        timeFormat = storePersistent.getState().settings[0].attrs[i].value;
                                }
                                if (storePersistent.getState().settings[0].attrs[i].attribute === "dateFormat") {
                                        dateFormat = storePersistent.getState().settings[0].attrs[i].value;
                                }
                        }
                }

                var format = dateFormat + " " + timeFormat;
                return format
        }
        //format is stored in user profile
        else {
                if (storePersistent.getState().profile[0] && storePersistent.getState().profile[0].userprefs) {
                        var userprefs = storePersistent.getState().profile[0].userprefs;
                        format = userprefs.date_format + " " + userprefs.time_format;

                        if (ms === true) {
                                if (userprefs.time_format === "hh:mm:ss A") {
                                        format = userprefs.date_format + " hh:mm:ss.SSS A";
                                }
                                else {
                                        format = userprefs.date_format + " " + userprefs.time_format + ".SSS";
                                }
                        }
                        //return moment(timestamp).format(format);
                        return format;
                }
                else {
                        return "";
                }

        }

}

