import storePersistent from "../store/indexPersistent";
import moment from 'moment-timezone';
import { timestampBucket} from '../bars/TimestampBucket.js';
import * as d3 from "d3";

export const parseTimestamp = (timestamp, ms = false) => {  
        var format = getTimeSetings(ms);

        if (format === "") {
                return moment(timestamp);
        }
        else if (Array.isArray(format)) {
                return moment.tz(timestamp, format[1]).format(format[0]);
        }
        else {
                return moment(timestamp).format(format);
        }
}

export const parseTimestampD3js = (timestamp_gte, timestamp_lte) => { 
        var format = getTimeSetings(false);
        //no profile
        if (format === "") {
                return d3.timeFormat(timestampBucket(timestamp_gte, timestamp_lte));
        }
        //timestamp with timezone stored in profile
        else if (Array.isArray(format)) {
                console.log("********************");
                console.log("using timezone");
                console.log(format[1]);
                console.log(timestamp_gte);
                console.log(moment.tz(timestamp_gte, format[1]));
                return  d3.timeFormat(timestampBucket(moment.tz(timestamp_gte, format[1]), moment.tz(timestamp_lte, format[1])));
               // return d3.timeFormat(timestampBucket(moment.tz(timestamp_gte, format[1]), moment.tz(timestamp_lte, format[1])));
        }
        //browser timezone
        else {
                return d3.timeFormat(timestampBucket(timestamp_gte, timestamp_lte));
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
                        var timezone = userprefs.timezone;

                        if (ms === true) {
                                if (userprefs.time_format === "hh:mm:ss A") {
                                        format = userprefs.date_format + " hh:mm:ss.SSS A";
                                }
                                else {
                                        format = userprefs.date_format + " " + userprefs.time_format + ".SSS";
                                }
                        }

                        if(timezone !== "browser"){
                                return [format, timezone]

                        }
                        else {
                                return format

                        }
                       // return moment(timestamp).format(format);
                       // return format;
                }
                else {
                        return "";
                }

        }

}

