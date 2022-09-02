import React, { Component } from 'react';
import status from '../helpers/status';
import { Redirect } from 'react-router';

/*
FORMAT   {errno: X, text: Y, level: Z}
LEVELS
1) error
    - {errno: 1, text: "Logstash is not running", level: "error"}
    - {errno: 2, text: "Elasticsearch is not running", level: "error"}
    - {errno: 3, text: "Disk full > 90%", level: "error"}
    - {errno: 6, text: "Can't connect to monitor server", level: "error" }
2) warning
    - {errno: 4, text: "Disk full > 80%", level: "warning"}
3) info
    - {errno: 5, text: "Downloading data", level: "info"}

*/
const NOTIFICATIONS = [
    {},
    { errno: 1, text: "Logstash is not running", level: "error" },
    { errno: 2, text: "Elasticsearch is not running", level: "error" },
    { errno: 3, text: "Disk full > 90%", level: "error" },
    { errno: 4, text: "Disk full > 80%", level: "warning" },
    { errno: 5, text: "Downloading data", level: "info" },
    { errno: 6, text: "Can't connect to monitor server", level: "error" }
]
class Notificationbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            redirect: false,
            statusCheck: null
        }
        this.remove = this.remove.bind(this);
        this.getAllNotifications = this.getAllNotifications.bind(this);
        this.showError = this.showError.bind(this);
        this.dontshow = this.dontshow.bind(this);
        this.shouldShow = this.shouldShow.bind(this);
        window.notification = this;

    }

    componentDidMount() {
        var self = this;
        let statusCheck = setInterval(async function () {

            //run ES? logstash status check every 30s
            let result = await status();
            if (!result.logstash) {
                self.showError(self.getNotification(1));
            }
            else {
                self.remove(1);
            }

            if (!result.elasticsearch) {
                self.showError(self.getNotification(2));
            }
            else {
                self.remove(2)
            }
        }, 30000);

        this.setState({statusCheck: statusCheck});
    }

    componentWillUnmount(){
        clearTimeout(this.state.statusCheck);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.error.length > 0) {
            var newNotification = [];
            let isFound = false;
            for (let i = 0; i < nextProps.error.length; i++) {
                for (let j = 0; j < this.state.notifications.length; j++) {
                    if (this.state.notifications[j].errno === nextProps.error[i].errno) {
                        isFound = true;
                        continue;
                    }
                }
                if (!isFound) {
                    newNotification.push(nextProps.error[i]);

                }
            }
        }
    }
    /**
* display errors in error bar
* @param {errors}  string
* @return {} 
* */
    showError(error) {
        let isFound = false;
        for (let j = 0; j < this.state.notifications.length; j++) {
            if (this.state.notifications[j].errno === error.errno) {
                isFound = true;
                continue;
            }
        }
        if (!isFound) {
            this.setState({
                notifications: this.state.notifications.concat(error)
            });
        }
        if (this.props.className !== "errorBarLoading") this.props.deleteAllErrors();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.error.length > 0) {
            this.showError(nextProps.error);
        }
    }

    /**
    * get notification object
    * @param {string}  errno  
    * @return {object} 
    * */
    getNotification(errno) {
        return NOTIFICATIONS[errno];
    }

    getAllNotifications() {
        return this.state.notifications;
    }

    /**
    * remove notification 
    * @param {object}  error an error 
    * @return {} stores in state 
    * */
    remove(errno) {
        var array = [...this.state.notifications];
        let isFound = false;
        for (let j = 0; j < array.length; j++) {
            if (array[j].errno === errno) {
                isFound = true;
                //for warning type only
                if (array[j].level === "warning") {
                    this.dontshow(errno);
                }
                array.splice(j, 1);

            }
        }

        if (isFound) {
            this.setState({ notifications: array });
        }
    }

    /**
  * don't show notification for one day 
  * @param {string}  errno
  * @return {} stores in state 
  * */
    dontshow(errno) {
        //dontshowNotification
        let dontshowNotification = JSON.parse(window.localStorage.getItem("dontshowNotification"));
        if (!dontshowNotification) dontshowNotification = [];
        let isFound = false;
        for (let notification of dontshowNotification) {
            if (notification.errno === errno) {
                isFound = true;
            }
        }
        if (!isFound) {
            dontshowNotification.push({ errno: errno, time: Date.now() });
            window.localStorage.setItem("dontshowNotification", JSON.stringify(dontshowNotification));
        }
    }

    shouldShow() {
        var notifications = this.state.notifications;
        var dontshowNotification = JSON.parse(window.localStorage.getItem("dontshowNotification"));
        if (!dontshowNotification) dontshowNotification = [];
        var result = [];
        var dontShowresult = [];
        //check for don't show nofications
        for (let notification of notifications) {
            if (dontshowNotification.length === 0) {
                result = notifications;
                continue;
            }
            for (let dontshow of dontshowNotification) {
                if (dontshow.errno === notification.errno) {
                    if (new Date() - 1000 * 60 * 60 >  dontshow.time) {
                        result.push(notification);
                    }
                    else {
                        dontShowresult.push(notification);
                    }
                }
                else {
                    result.push(notification);
                }
            }
            window.localStorage.setItem("dontshowNotification", JSON.stringify(dontShowresult));
        }

        return result;
    }

    render() {
        var notifications = this.shouldShow();
        if (notifications.length === 0) {
            return (<div></div>)
        } else {

            return (
                <div className="row" >
                    {window.location.pathname !== "/monitoring" && <div className={this.props.className}>  {this.state.notifications.map((notification, i) => {
                        return <div key={i} style={notification.level === "error" ? { "backgroundColor": "#e84258", "padding": "4px" } : notification.level === "warning" ? { backgroundColor: "#fee191", "padding": "4px" } : { backgroundColor: "#B0D8A4", "padding": "4px" }}>
                            {notification.level !== "error" && <button className="closeButton" onClick={() => this.remove(notification.errno)}>&times;</button>} <span onClick={() => this.setState({ "redirect": true })} style={notification.level === "error" ? { "cursor": "pointer", "paddingLeft": "25px" } : { "cursor": "pointer" }}>{notification.text}</span>
                        </div>
                    })}
                    </div>}
                    {this.state.redirect && <Redirect push to="/monitoring" />}
                </div>)
        }

    }
}

export default Notificationbar;
