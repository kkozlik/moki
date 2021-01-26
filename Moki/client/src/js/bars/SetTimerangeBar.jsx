import React, {
    Component
} from 'react';
import Datetime from 'react-datetime';
import timeForward from "../../styles/icons/timeForward.png";
import timeBack from "../../styles/icons/timeBack.png";
import shareIcon from "../../styles/icons/share.png";
import store from "../store/index";
import { setTimerange } from "../actions/index";
import reloadIcon from "../../styles/icons/reload.png";
import historyIcon from "../../styles/icons/reload_time.png";
import historyIconGrey from "../../styles/icons/reload_time_grey.png";
import refreshIcon from "../../styles/icons/refresh.png";
import refreshStopIcon from "../../styles/icons/refreshStop.png";
import Popup from "reactjs-popup";
import Export from "./Export";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class timerangeBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timerange: "",
            sipUser: store.getState().user.user,
            timestamp_gte: store.getState().timerange[0],
            timestamp_lte: store.getState().timerange[1],
            refreshInterval: 15000,
            refreshIcon: refreshIcon,
            historyIcon: historyIconGrey,
            timer: "",
            refreshUnit: "seconds",
            refreshValue: 30,
            click: false,
            history: []
        }
        this.setTimerange = this.setTimerange.bind(this);
        this.close = this.close.bind(this);
        this.share = this.share.bind(this);
        this.setToNow = this.setToNow.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.moveTimerangeBack =
            this.moveTimerangeBack.bind(this);
        this.moveTimerangeForward =
            this.moveTimerangeForward.bind(this);
        this.changeTimerange = this.changeTimerange.bind(this);
        this.renderPDF = this.renderPDF.bind(this);
        this.rerenderTimerange = this.rerenderTimerange.bind(this);
        this.reload = this.reload.bind(this);
        this.setRefresh = this.setRefresh.bind(this);
        this.refresh = this.refresh.bind(this);
        this.setTimerangeLastX = this.setTimerangeLastX.bind(this);
        this.focousOutLte = this.focousOutLte.bind(this);
        this.focousOutGte = this.focousOutGte.bind(this);
        this.popupTrigger = React.createRef();
        this.addHistory = this.addHistory.bind(this);
        this.loadHistory = this.loadHistory.bind(this);
        store.subscribe(() => this.rerenderTimerange());


        //change timerange if set in url
        //format: from=XXXXXXX&to=YYYYYYYY

        //set refresh with time in seconds
        //format: &refresh=60
        var parameters = window.location.search;

        if (parameters) {
            var timestamp_gte = parseInt(parameters.substring(parameters.indexOf("from=") + 5, parameters.indexOf("to=")));
            var timestamp_lte = parseInt(parameters.substring(parameters.indexOf("to=") + 3));
            var refreshTime = parameters.indexOf("refresh=") !== -1 ? parseInt(parameters.substring(parameters.indexOf("refresh=") + 8)) : 0;
            if (timestamp_gte && timestamp_lte) {
                var timestamp_readiable = new Date(timestamp_gte).toLocaleString() + " - " + new Date(timestamp_lte).toLocaleString();

                store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));

                this.setState({
                    timerange: timestamp_readiable,
                    timestamp_gte: timestamp_gte,
                    timestamp_lte: timestamp_lte
                });
            }

            if (refreshTime !== 0) {
                function refresh() {
                    var timestamp_lteOld = store.getState().timerange[1];
                    var timestamp_lte = Math.round((new Date()).getTime() / 1000) * 1000;
                    var timestamp_gte = store.getState().timerange[0];
                    timestamp_gte = timestamp_lte - (timestamp_lteOld - timestamp_gte);
                    var timestamp_readiable = new Date(timestamp_gte).toLocaleString() + " - " + new Date(timestamp_lte).toLocaleString();
                    store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]))
                }
                console.log("setting auto refresh every " + refreshTime + " ms.");
                window.setInterval(refresh, refreshTime);
            }

        }
    }


    //add to time history
    addHistory(timerange, timestamp_gte, timestamp_lte) {
        var historyTime = {
            timestamp: timerange,
            timestamp_gte: timestamp_gte,
            timestamp_lte: timestamp_lte
        }
        //keep only last 7 time ranges
        if (this.state.history.length > 7) {
            this.setState({ history: this.state.history.shift() });
        }
        this.setState({
            history: [...this.state.history, [historyTime]],
            historyIcon: historyIcon
        })
    }

    loadHistory() {
        if (this.state.history.length !== 0) {
            var history = this.state.history;
            var lastHistory = history.pop();
            this.setState({
                history: history
            });
            store.dispatch(setTimerange([lastHistory[0].timestamp_gte, lastHistory[0].timestamp_lte, lastHistory[0].timestamp]));
        }
        if (this.state.history.length === 0) {
            this.setState({
                historyIcon: historyIconGrey
            });

        }
    }

    //if store timernage changes, render new state
    rerenderTimerange() {
        if (store.getState().timerange[2] !== this.state.timerange) {
            console.info("Timerange is changed to " + store.getState().timerange[2]);
            this.setState({
                timerange: store.getState().timerange[2],
                timestamp_gte: store.getState().timerange[0],
                timestamp_lte: store.getState().timerange[1]
            });
        }
    }

    //share - create url with filters, types and time
    share() {
        var href = window.location.origin + window.location.pathname + "?from=" + store.getState().timerange[0] + "&to=" + store.getState().timerange[1];

        var filters = store.getState().filters;
        if (filters) {
            for (var i = 0; i < filters.length; i++) {
                if (filters[i].state === "enable") {
                    href = href + "&filter=" + filters[i].title;
                }
            }

        }
        var types = store.getState().types;
        if (types) {
            for (i = 0; i < types.length; i++) {
                if (types[i].state === "enable") {
                    href = href + "&type=" + types[i].id;
                }
            }

        }

        //put it into clipboard
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = href;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);

        document.getElementById("tooltipshare").style.display = "inline";
        setTimeout(function () {
            document.getElementById("tooltipshare").style.display = "none";
        }, 1000);
    }

    //set refresh
    setRefresh() {

        var e = document.getElementById("timeUnit");

        //  var value = e.options[e.selectedIndex].value;   
        var refreshInterval = document.getElementById("refresh").value * 1000
        if (e.options[e.selectedIndex].value === "minutes") {
            refreshInterval = document.getElementById("refresh").value * 60000
        }
        else if (e.options[e.selectedIndex].value === "hours") {
            refreshInterval = document.getElementById("refresh").value * 3600000
        }

        this.setState({
            refreshInterval: refreshInterval,
            refreshUnit: e.options[e.selectedIndex].value,
            refreshValue: document.getElementById("refresh").value,
            click: false
        });
    }

    //refresh
    refresh() {
        //stop refresh
        if (this.state.refreshIcon === refreshStopIcon) {
            clearInterval(this.state.timer);
            this.setState({ refreshIcon: refreshIcon });
        }
        //start refresh
        else {

            var refreshInterval = this.state.refreshInterval;
            console.info("Refresh started. Interval is " + refreshInterval);
            function refresh() {
                var timestamp_lteOld = store.getState().timerange[1];
                var timestamp_lte = Math.round((new Date()).getTime() / 1000) * 1000;
                var timestamp_gte = store.getState().timerange[0];
                timestamp_gte = timestamp_lte - (timestamp_lteOld - timestamp_gte);
                var timestamp_readiable = new Date(timestamp_gte).toLocaleString() + " - " + new Date(timestamp_lte).toLocaleString();
                store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]))
            }

            refresh();
            var timer = window.setInterval(refresh, refreshInterval);
            this.setState({
                refreshIcon: refreshStopIcon,
                timer: timer
            });

        }


    }

    //reload data
    reload() {

        //relative time
        if (this.state.timerange.includes("+")) {

            if (this.state.timerange.includes("+ 6 hours")) {
                this.setTimerangeLastX("Last 6 hours");
            }
            else if (this.state.timerange.includes("+ 12 hours")) {
                this.setTimerangeLastX("Last 12 hours");
            }
            else if (this.state.timerange.includes("+ 1 day")) {
                this.setTimerangeLastX("Last 1 day");
            }
            else if (this.state.timerange.includes("+ 3 days")) {
                this.setTimerangeLastX("Last 3 days");
            }
            else if (this.state.timerange.includes("+ 15 min")) {
                this.setTimerangeLastX("Last 15 min");
            }
            else if (this.state.timerange.includes("+ 5 min")) {
                this.setTimerangeLastX("Last 5 min");
            }
            else if (this.state.timerange.includes("+ 1 hour")) {
                this.setTimerangeLastX("Last 1 hour");
            }
            else if (this.state.timerange === "Today" || this.state.timerange === "Yesterday" || this.state.timerange === "Last week") {
                this.setTimerangeLastX(this.state.timerange);
            }
        }
        //absolute time
        else {
            //this.addHistory(store.getState().timerange[2], store.getState().timerange[0], store.getState().timerange[1]);
            store.dispatch(setTimerange(store.getState().timerange));

        }

    }

    focousOutLte(value) {
        this.setState({ timestamp_lte: value });

    }
    focousOutGte(value) {
        this.setState({ timestamp_gte: value });

    }
    //set to current timestamp
    setToNow() {
        var timestamp_gte = store.getState().timerange[0];
        var timestamp_lte = new Date();
        var timestamp_readiable = new Date(timestamp_gte).toLocaleString() + " - " + new Date(timestamp_lte).toLocaleString();

        store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));

        this.focousOutLte(timestamp_lte);
        document.getElementById("dropdownMenuButton").click();

    }

    //move half of timerange value back
    moveTimerangeForward(event) {
        this.addHistory(store.getState().timerange[2], store.getState().timerange[0], store.getState().timerange[1]);
        var timestamp_gte = store.getState().timerange[0] - (store.getState().timerange[1] - store.getState().timerange[0]);

        //Math.round(store.getState().timerange[0]/2000)*1000; 

        var timestamp_lte = store.getState().timerange[1];
        var timestamp_readiable = new Date(timestamp_gte).toLocaleString() + " - " + new Date(timestamp_lte).toLocaleString();

        this.setState({
            timerange: timestamp_readiable
        });
        console.info("Timerange is changed to " + timestamp_readiable);
        store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));
    }

    moveTimerangeBack(event) {
        this.addHistory(store.getState().timerange[2], store.getState().timerange[0], store.getState().timerange[1]);
        var timestamp_gte = store.getState().timerange[0];
        var timestamp_lte = store.getState().timerange[1] + (store.getState().timerange[1] - store.getState().timerange[0]);

        var timestamp_readiable = new Date(timestamp_gte).toLocaleString() + " - " + new Date(timestamp_lte).toLocaleString();

        this.setState({
            timerange: timestamp_readiable
        });

        console.info("Timerange is changed to " + timestamp_readiable);
        store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));

    }

    //set timerange
    changeTimerange(timestamp_gte, timestamp_lte) {
        this.addHistory(store.getState().timerange[2], store.getState().timerange[0], store.getState().timerange[1]);
        var timestamp_readiable = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " - " + new Date(Math.trunc(timestamp_lte)).toLocaleString();

        this.setState({
            timerange: timestamp_readiable
        });

        console.info("Timerange is changed to " + timestamp_readiable);

        store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));
        timestamp_gte = Math.trunc(timestamp_gte);
    }



    setTimerangeLastX(timerange) {
        //save old timerange
        this.addHistory(this.state.timerange, this.state.timestamp_gte, this.state.timestamp_lte);
        var timestamp_gte = "";
        var timestamp_lte = new Date();
        if (timerange === "Last 6 hours") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (6 * 3600)) * 1000;
            timerange = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " + 6 hours";
        }
        else if (timerange === "Last 12 hours") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (12 * 3600)) * 1000;
            timerange = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " + 12 hours";
        }
        else if (timerange === "Last 1 day") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (24 * 3600)) * 1000;
            timerange = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " + 1 day";
        }
        else if (timerange === "Last 3 days") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (72 * 3600)) * 1000;
            timerange = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " + 3 days";
        }
        else if (timerange === "Last 15 min") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (15 * 60)) * 1000;
            timerange = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " + 15 min";
        }
        else if (timerange === "Last 5 min") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (5 * 60)) * 1000;
            timerange = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " + 5 min";
        }
        else if (timerange === "Last 1 hour") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (3600)) * 1000;
            timerange = new Date(Math.trunc(timestamp_gte)).toLocaleString() + " + 1 hour";
        }
        else if (timerange === "Today") {
            timestamp_gte = new Date();
            timestamp_gte.setHours(0, 0, 0, 0);
            timestamp_gte = Math.round(timestamp_gte / 1000) * 1000;
        }
        else if (timerange === "Yesterday") {
            timestamp_lte = new Date();
            timestamp_lte.setHours(24, 0, 0, 0);
            timestamp_lte = Math.round(timestamp_lte.setDate(timestamp_lte.getDate() - 1));

            timestamp_gte = new Date();
            timestamp_gte.setHours(0, 0, 0, 0);
            timestamp_gte = Math.round(timestamp_gte.setDate(timestamp_gte.getDate() - 1));
        }
        else if (timerange === "Last week") {
            timestamp_gte = (Math.round(timestamp_lte.getTime() / 1000) - (189 * 3600)) * 1000;
        }

        if (timerange !== "Yesterday") {
            timestamp_lte = Math.round((timestamp_lte).getTime() / 1000) * 1000;
        }

        this.setState({
            timerange: timerange,
            timestamp_gte: timestamp_gte,
            timestamp_lte: timestamp_lte,
            click: false
        });
        console.info("Timerange is changed to " + timerange + " " + timestamp_gte + " " + timestamp_lte);

        store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timerange]));
    }

    //compute and set timerange in UNIX timestamp
    setTimerange(event) {
        //set timestamp fron datepicker
        if (event.target.className === "setTimerange btn btn-primary") {
            const timestamp_lte = document.getElementsByClassName("timestamp_lteInput")[0].childNodes[0].value;

            const timestamp_gte = document.getElementsByClassName("timestamp_gteInput")[0].childNodes[0].value;

            if (new Date(timestamp_gte).getTime() < 0) {
                this.props.showError("Error: Timestamp 'FROM' is not valid date.");
                return;
            }

            if (new Date(timestamp_lte).getTime() < 0) {
                this.props.showError("Error: Timestamp 'TO' is not valid date.");
                return;
            }
            this.addHistory(store.getState().timerange[2], store.getState().timerange[0], store.getState().timerange[1]);
            const gte = Math.round((new Date(timestamp_gte)).getTime() / 1000) * 1000;
            const lte = Math.round((new Date(timestamp_lte)).getTime() / 1000) * 1000;

            if (gte - lte > 0) {
                this.props.showError("Error: Timestamp 'FROM' has to be lower than 'TO'.");
                return;
            }
            var timestamp_readiable = timestamp_gte + " - " + timestamp_lte;

            console.info("Timerange is changed to " + timestamp_readiable + " " + gte + " " + lte);

            this.setState({
                timerange: timestamp_readiable,
                click: false
            });
            store.dispatch(setTimerange([gte, lte, timestamp_readiable]));
        }
        //set timestamp from dropdown menu
        else {
            var timerange = event.target.innerHTML;
            this.setTimerangeLastX(timerange);


        }
    }


    //close select time window
    close() {
        this.setState({
            click: false
        });
    }

    renderPDF() {
        const input = document.getElementById('context');
        html2canvas(input).then(function (canvas) {
            var imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', [canvas.width - 50, canvas.height - 100]);
            pdf.addImage(imgData, 'PNG', 0, 0);
            var pathname = window.location.pathname;
            pathname = pathname.substr(1);
            pdf.save(pathname + ".pdf");
        });
    }

    exportCSV() {
        document.getElementById("CSVexport").style.display = "block";
    }

    exportJSON() {
        document.getElementById("JSONexport").style.display = "block";
    }

    toggleMenu() {
        this.setState({ click: true });
    }

    render() {
        //const sipUser = this.state.sipUser.user;
        // const aws =store.getState().user.aws;
        let sipUserSwitch = <div />;
        var name = window.location.pathname.substr(1);
        return (
            <div id="popup">
                <div className="d-flex justify-content-between">
                    {sipUserSwitch}
                    <div className="dropdown float-right text-right">
                        <button className="btn dropdown-toggle" type="button" id="dropdownMenuExportButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Export
                        </button>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuExportButton">
                            <div id="exportMenu">
                                <button className="dropdown-item tabletd" onClick={this.exportCSV}>CSV</button>
                                <button className="dropdown-item tabletd" onClick={this.exportJSON}>JSON</button>
                                <button className="dropdown-item tabletd" onClick={this.renderPDF}>PDF</button>
                            </div>
                        </div>
                    </div>

                    <div className="dropdown float-right text-right">
                        <span onClick={this.share} className="tabletd marginRight" ><img className="iconShare" alt="shareIcon" src={shareIcon} title="share" /><span id="tooltipshare" style={{ "display": "none" }}>copied to clipboard</span></span>
                        <span className="tabletd marginRight" onClick={this.moveTimerangeForward}><img alt="timeBackIcon" src={timeBack} title="move back" /></span><span className="tabletd marginRight" onClick={this.moveTimerangeBack}> <img alt="timeForwardIcon" src={timeForward} title="move forward" /></span>
                        <span onClick={this.reload} className="tabletd marginRight" ><img className="iconReload" alt="reloadIcon" src={reloadIcon} title="reload" /></span>
                        <span onClick={this.loadHistory} className="tabletd marginRight" ><img className="iconHistory" alt="historyIcon" src={this.state.historyIcon} title="previous time range" /></span>
                        <span onClick={this.refresh} className="tabletd" ><img style={{ "marginLeft": "10px", "marginRight": "0px" }} className="iconRefresh" alt="refreshIcon" src={this.state.refreshIcon} title="refresh" /></span>
                        <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton" onClick={this.toggleMenu} aria-haspopup="true" aria-expanded="false">
                            {store.getState().timerange[2]}
                        </button>
                        {this.state.click && <div className="dropdown-menu dropdown-menu-right show" aria-labelledby="dropdownMenuButton" id="toggleDropdown" style={{ "display": "block" }}>
                            <div className="row" id="timeMenu">
                                <div className="col-4 ">
                                    <h3 className="margins">Relative time</h3>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange}>Last 5 min</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange}>Last 15 min</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange}>Last 1 hour</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange}>Last 6 hours</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange} >Last 12 hours</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange} >Last 1 day</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange} >Today</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange} >Yesterday</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange} >Last 3 days</button>
                                    <button className="dropdown-item tabletd" onClick={this.setTimerange} >Last week</button>
                                </div>
                                <div className="col">
                                    <form className="px-4 py-3">
                                        <div className="form-group">
                                            <h3>Absolute time</h3>
                                            <p>From:</p>
                                            <Datetime closeOnTab
                                                closeOnSelect
                                                timeFormat="HH:mm:ss"
                                                className="timestamp_gteInput"
                                                input={true}
                                                onBlur={this.focousOutGte}
                                                onChange={this.focousOutGte}
                                                defaultValue={new Date(this.state.timestamp_gte)} />
                                            <p>To: <button className="link" onClick={this.setToNow}>(now)</button></p>
                                            <Datetime closeOnTab
                                                closeOnSelect
                                                timeFormat="HH:mm:ss"
                                                onBlur={this.focousOutLte}
                                                onChange={this.focousOutLte}
                                                defaultValue={new Date(this.state.timestamp_lte)}
                                                className="timestamp_lteInput" />
                                        </div>
                                    </form>

                                </div>
                                <button style={{ "marginLeft": "10%", "marginTop": "60px" }} onClick={this.close} className="setTimerange btn btn-secondary">Cancel</button>  <button style={{ "marginTop": "60px" }} onClick={this.setTimerange} className="setTimerange btn btn-primary">Set</button>
                            </div>
                            <hr></hr>
                            <div className="row" style={{ "marginLeft": "15px" }}>
                                <br />
                                <h3 style={{ "marginTop": "15px" }}>Refresh </h3>
                            </div>
                            <div className="row" style={{ "marginLeft": "30px" }}>
                                <p style={{ "whiteSpace": "pre-wrap" }}>every </p> <input type="number" id="refresh" min="1" max="60" defaultValue={this.state.refreshValue} style={{ "width": "fit-content" }} /><select id="timeUnit" style={{ "width": "fit-content" }} defaultValue={this.state.refreshUnit} >
                                    <option value="seconds">seconds</option>
                                    <option value="minutes">minutes</option>
                                    <option value="hours">hours</option>
                                </select>
                                <button onClick={this.setRefresh} className="setTimerange btn btn-secondary" style={{ "marginLeft": "50px" }}>OK</button>
                            </div>

                        </div>
                        }
                    </div>



                </div>
                {name !== "web" && <div className="export" id="CSVexport">
                    <button className="close" onClick={(function () { document.getElementById("CSVexport").style.display = "none" })}>
                        &times;
                        </button>
                    <Export type="CSV" />
                </div>
                }
                {name !== "web" && <div className="export" id="JSONexport">
                    <button className="close" onClick={(function () { document.getElementById("JSONexport").style.display = "none" })}>
                        &times;
                        </button>
                    <Export type="JSON" />
                </div>
                }
            </div>
        );
    }
}
export default timerangeBar;

