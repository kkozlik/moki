import storePersistent from "../store/indexPersistent";
import moment from 'moment-timezone';
import { timestampBucket} from '../bars/TimestampBucket.js';
import * as d3 from "d3";

export const parseTimestamp = (timestamp, ms = false) => {  
        var format = getTimeSetings(ms);
        //no format
        if (format === "") {
                return new Date(timestamp).toLocaleString();
        }
        //timezone and format from settings 
        else if (Array.isArray(format)) {
                return moment.tz(timestamp, format[1]).format(format[0]);
        }
        //browser timezone, format from settings
        else {
                return moment(timestamp).format(format);
        }
}

export const parseTimestampUTC = (timestamp, ms) => {  
        var format = getTimeSetings(ms);

        if (format === "") {
                return new Date(timestamp).toLocaleString();
        }
        else if (Array.isArray(format)) {
                return moment.utc(timestamp).format(format[0]);
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
                return  d3.utcFormat(timestampBucket(timestamp_gte, timestamp_lte));
        }
        //browser timezone
        else {
                return d3.timeFormat(timestampBucket(timestamp_gte, timestamp_lte));
        }
}

export function parseTimeData(value){
        var format = getTimeSetings(false);
        //no profile
        if (format === "") {
                return value;
        }
        //timestamp with timezone stored in profile
        else if (Array.isArray(format)) {
                return value + (moment.unix(value).tz(format[1]).utcOffset()*60*1000);
              
        }
        //browser timezone
        else {
                return value;
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
                }
                else {
                        return "";
                }

        }

}

