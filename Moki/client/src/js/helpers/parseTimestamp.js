import storePersistent from "../store/indexPersistent";
import moment from 'moment';

export const parseTimestamp = (timestamp) => {       
        var aws = storePersistent.getState().user.aws;
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

                return moment(timestamp).format(format);
        }
        else {
                return new Date(timestamp).toLocaleString();
        }
}
