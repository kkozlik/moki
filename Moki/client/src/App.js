import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'jquery/src/jquery';
import React, { Component } from 'react';
import './App.css';
import NavBar from './js/bars/NavigationBar';
import FirstLoginPopup from './js/helpers/firstLoginPopup';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import TimerangeBar from './js/bars/SetTimerangeBar';
import { getLayoutSettings } from './js/helpers/getLayout';
import { getSettings } from './js/helpers/getSettings';
import FilterBar from './js/bars/FilterBar';
import Restricted from './js/dashboards/Restricted/Restricted';
import Sequence from './js/pages/sequenceDiagram';
import store from "./js/store/index";
import storePersistent from "./js/store/indexPersistent";
import { setUser, setWidthChart, setLayout, setSettings } from "./js/actions/index";
import { Redirect } from 'react-router';
import { paths } from "./js/controllers/paths.jsx";
import { getProfile } from '@moki-client/gui';
import Popup from "./js/helpers/Popup";
import DecryptPasswordPopup from '@moki-client/gui/src/menu/decryptPasswordPopup';
import Notificationbar from './js/bars/Notificationbar';
import { parseTimestamp } from "./js/helpers/parseTimestamp";
import { setTimerange } from "./js/actions/index";
import { setFilters } from "./js/actions/index";
import { createFilter } from '@moki-client/gui';
const BASE_NAME = process.env.PUBLIC_URL;

//General class - check user level, profile from ES, monitor_layout before loading monitor
//return router with dashboards and bars
class App extends Component {
    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {            redirect: false,
            firstTimeLogin: false,
            isLoading: true,
            aws: false,
            monitorName: "",
            admin: false,
            siteAdmin: false,
            hostnames: "",
            dstRealms: [],
            tags: [],
            tagsFull: [],
            srcRealms: [],
            dashboards: [],
            dashboardsUser: [],
            dashboardsSettings: [],
            logo: "",
            user: {},
            resizeId: ""
        }
        this.setFirstTimeLogin = this.setFirstTimeLogin.bind(this);
        this.redirect = this.redirect.bind(this);
        this.getHostnames = this.getHostnames.bind(this);
        this.checkURLFilters = this.checkURLFilters.bind(this);
        this.getSipUser();
    }

    componentDidMount() {
        var thiss = this;
        //resize window function
        window.addEventListener('resize', function () {
            if (thiss.state.resizeId) clearTimeout(thiss.state.resizeId);
            thiss.setState({ resizeId: setTimeout(thiss.windowResize, 500) });
        });

    }

    //check url parameters for filters
    async checkURLFilters() {
        //change timerange if set in url
        //format: from=XXXXXXX&to=YYYYYYYY
        var parameters = decodeURIComponent(window.location.search);
        if (parameters) {
            var timestamp_gte = parseInt(parameters.substring(parameters.indexOf("from=") + 5, parameters.indexOf("to=")));
            var timestamp_lte = parseInt(parameters.substring(parameters.indexOf("to=") + 3));
            if (timestamp_gte && timestamp_lte) {
                var timestamp_readiable = parseTimestamp(new Date(timestamp_gte)) + " - " + parseTimestamp(new Date(timestamp_lte));

                store.dispatch(setTimerange([timestamp_gte, timestamp_lte, timestamp_readiable]));

                this.setState({
                    timerange: timestamp_readiable,
                    timestamp_gte: timestamp_gte,
                    timestamp_lte: timestamp_lte
                });
            }

            var result = [];
            var filters = parameters.indexOf("filter=");
            if (parameters && filters !== -1) {
                var id = 1;
                while (filters !== -1) {
                    var last = parameters.indexOf("&", filters + 7);
                    if (last === -1) {
                        result.push(await createFilter(parameters.substring(filters + 7), id, false, true));
                    }
                    else {
                        result.push(await createFilter(parameters.substring(filters + 7, last), id, false, true));
                    }
                    filters = parameters.indexOf("filter=", (filters + 1));
                    id++;
                }
                store.dispatch(setFilters(result));
            }
        }

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResize);
    }

    /**
* get monitor version from cmd and layout settings
* @return {} stores everything in state
* */
    async getMonitorSettings() {
        //get monitor version
        var url = BASE_NAME + "/api/monitor/version";
        var monitorVersion = "";
        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            monitorVersion = await response.json();
            monitorVersion = monitorVersion.error ? "" : monitorVersion.version;

        } catch (error) {
            console.error(error);
        }


        var res = await getProfile(this.state.user);

        if (res !== "ok") {
            //this.showError(JSON.stringify(res));
        }
        
        //store layout
        var jsonData = await getLayoutSettings();
        storePersistent.dispatch(setLayout(jsonData));
        console.info(jsonData);
        console.info("Storing layout");

        //get settings if exists
        var aws = this.state.user.aws;
        if (aws !== true) {
            var jsonSettings = await getSettings();
            storePersistent.dispatch(setSettings(jsonSettings));

            //check if first time login
            const response = await fetch(BASE_NAME + "/api/user/check", {
                method: "GET",
                timeout: 10000,
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });

            const json = await response.json();
            if (!response.ok) {
                return;
            }
            if (json.msg && json.msg === true) {
                this.setState({ firstTimeLogin: true });
            }
        }

        //get dashboard list
        var dashboards = Object.keys(jsonData.dashboards);
        if ((this.state.aws && !this.state.admin) || !this.state.aws) {
            dashboards = dashboards.filter(dashboard => jsonData.dashboards[dashboard]);
        }

        this.setState({
            dashboards: dashboards
        });

        //get settings dashboard list
        var dashboardsSettings = Object.keys(jsonData.settingsDashboards);
        if ((this.state.aws && !this.state.admin) || !this.state.aws) {
            dashboardsSettings = dashboardsSettings.filter(dashboard => jsonData.settingsDashboards[dashboard]);

            //remove users from settings
            dashboardsSettings = dashboardsSettings.filter(dashboard => dashboard !== "users");
        }

        //for admin level aws remove WBlist
        if (this.state.aws && this.state.admin) {
            dashboardsSettings = dashboardsSettings.filter(dashboard => dashboard !== "wblist");
            dashboardsSettings = dashboardsSettings.filter(dashboard => dashboard !== "config");
        }

        this.setState({
            dashboardsSettings: dashboardsSettings
        });

        //get user dashboard list
        var userSettings = Object.keys(jsonData.userDashboards);
        if ((this.state.aws && !this.state.admin) || !this.state.aws) {
            userSettings = userSettings.filter(dashboard => jsonData.userDashboards[dashboard]);
        }
        this.setState({
            dashboardsUser: userSettings
        });

        //set logo
        this.setState({
            logo: jsonData.logo
        });

        //set favicon
        this.setState({ logo: "data:;base64," + await this.getLogo(jsonData.logo) },
            async () => {
                document.getElementById("favicon").href = "data:;base64," + await this.getLogo(jsonData.favicon);

                //set main and secondary color
                document.body.style.setProperty('--main', jsonData.color);
                document.body.style.setProperty('--second', jsonData.colorSecondary);

                this.setState({
                    monitorName: jsonData.name + " " + monitorVersion,
                    isLoading: false
                });
            });

        await this.checkURLFilters();
    }

    //change value if first time login
    setFirstTimeLogin(value) {
        this.setState({
            firstTimeLogin: value
        })
    }

    /**
* load logo from server based on the path in monitor_layout.json
* @param {path}  path path to logo img
* @return {base64} return img in base64
* */
    async getLogo(path) {
        var url = BASE_NAME + "/api/monitor/logo";
        try {
            const response = await fetch(url, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                },
                body: JSON.stringify({
                    "path": path
                })
            });
            var logo = await response.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(logo).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    '',
                ),
            );
            return base64;
        } catch (error) {
            console.error(error);
        }
    }

    /**
* Get user settings stored in ES
* @param {string}  attribute to retrieve
* @return {response} json response from ES
* */
    async getUserSetting(attribute) {
        var url = BASE_NAME + "/api/setting/user";
        try {
            const response = await fetch(url, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                },
                body: JSON.stringify({
                    "attribute": attribute
                })
            });
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }


    /**
* hostnames, realms list to set colors, tags list
* @return {} stores in state
* */
    async getHostnames() {
        const request = async () => {
            try {
                const response = await fetch(BASE_NAME + "/api/hostnames", {
                    method: "GET",
                    timeout: 10000,
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"
                    }
                });

                const json = await response.json();
                if (!response.ok) {
                    return;
                }
                var hostnames = [];
                var hostnamesColor = [];
                if (json.responses && json.responses[0] && json.responses[0].aggregations && json.responses[0].aggregations.distinct && json.responses[0].aggregations.distinct.buckets) {
                    hostnames = json.responses[0].aggregations.distinct.buckets;
                    var colors = ['#58a959', '#61BEE2', '#f58231', '#00008B', '#c41d03', '#2077e8', '#41FA51', '#d66bad', '#ffe119', '#e6beff', '#ccc8a0', '#aa59e0', '#99e5af', '#d18e1a', '#465D00'];
                    for (var i = 0; i <= hostnames.length; i++) {
                        if (hostnames[i]) {
                            hostnamesColor[hostnames[i].key] = colors[i % 14];
                        }
                    }
                }

                if (json.responses && json.responses[1] && json.responses[1].aggregations && json.responses[1].aggregations.distinct && json.responses[1].aggregations.distinct.buckets) {
                    var realms = json.responses[1].aggregations.distinct.buckets;
                    for (i = 0; i <= realms.length; i++) {
                        if (realms[i]) {
                            hostnamesColor[realms[i].key] = colors[i % 14];
                        }
                    }
                }

                //get src realms
                if (json.responses && json.responses[2] && json.responses[2].aggregations && json.responses[2].aggregations.distinct && json.responses[2].aggregations.distinct.buckets) {
                    this.setState({
                        srcRealms: json.responses[2].aggregations.distinct.buckets
                    });
                }

                //get dst realms
                if (json.responses && json.responses[3] && json.responses[3].aggregations && json.responses[3].aggregations.distinct && json.responses[3].aggregations.distinct.buckets) {
                    this.setState({
                        dstRealms: json.responses[3].aggregations.distinct.buckets
                    });
                }
                //get tags
                if (json.responses && json.responses[4] && json.responses[4].aggregations && json.responses[4].aggregations.distinct && json.responses[4].aggregations.distinct.buckets) {

                    //if tags is array split it
                    var tags = [];
                    for (i = 0; i < json.responses[4].aggregations.distinct.buckets.length; i++) {
                        if (Array.isArray(json.responses[4].aggregations.distinct.buckets[i].key)) {
                            tags.push(json.responses[4].aggregations.distinct.buckets[i].key.slice());
                        } else {
                            tags.push(json.responses[4].aggregations.distinct.buckets[i].key);
                        }

                    }
                    this.setState({
                        tags: tags,
                        tagsFull: json.responses[4].aggregations.distinct.buckets
                    });
                }

                this.setState({
                    hostnames: hostnamesColor
                });
            }
            catch (er) {
                window.notification.showError( { errno: 6, text: er, level: "error" });
            }
        }
        request();
    }

    //change charts width if windows width changes 
    windowResize() {
        if (window.innerWidth !== store.getState().width) store.dispatch(setWidthChart(window.innerWidth));
    }

    /**
* get sip user level, based on that show dashboards and monitor layout
* @return {} stores in state
* */
    async getSipUser() {
        var response = "";
        try {
            var sip;
            response = await fetch(BASE_NAME + "/api/user/sip", {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                "Access-Control-Allow-Credentials": "include"
            });
            if (!response.ok) {
                window.notification.showError( { errno: 6, text: "Monitor server is not running.", level: "error" });
            }
            else {
                sip = await response.json();
                console.info("USER login:");
                console.info(sip);

                if (sip.redirect && !window.location.pathname.includes("no-sip-identity")) {
                    console.info("redirect to no-sip-identity");
                    window.location.href = "/no-sip-identity?err=" + sip.redirect;
                    return;
                }
                else if (!window.location.pathname.includes("no-sip-identity")) {
                    if (sip.aws === false) {
                        this.setState({
                            aws: false
                        })
                    } else {
                        this.setState({
                            aws: true
                        })
                    }

                    console.info("MOKI: sip user: " + sip.user);

                    //get username
                    try {
                        response = await fetch(BASE_NAME + "/api/user/username", {
                            method: "GET",
                            credentials: 'include',
                            headers: {
                                "Content-Type": "application/json",
                                "Access-Control-Allow-Credentials": "include"
                            }
                        })

                        var res = await response.json();
                        sip.username = res.username;
                    } catch (error) {

                    }

                    //set user info :  email:email, domainID:domainID, jwt: jwtbit
                    storePersistent.dispatch(setUser(sip));
                    this.setState({
                        user: sip
                    })

                    //set admin
                    if (sip.jwt === 0) {
                        this.setState({
                            admin: true
                        })
                    }

                    if (sip.jwt === 1 || sip.user === "DEFAULT") {
                        this.setState({
                            siteAdmin: true
                        })
                    }

                    //default user: no need to log in for web
                    if (sip.user !== "DEFAULT") {
                        this.getMonitorSettings();
                        this.getHostnames();
                    }
                    else {
                        //store layout
                        var jsonData = await getLayoutSettings();
                        storePersistent.dispatch(setLayout(jsonData));
                        this.setState({
                            dashboards: ["web"],
                            isLoading: false
                        });
                    }
                }
            }
        } catch (error) {
            if (response.status === 500) {
                window.notification.showError( { errno: 6, text: "Monitor server is not running.", level: "error" });

            } else {
                console.error(error);
                window.notification.showError( { errno: 2, text: "Check elasticsearch connection and restart the page.", level: "error" });
            }
        }
    }

    redirect() {
        if (this.state.redirect === "false") {
            this.setState({
                redirect: "true"
            })
        } else {
            this.setState({
                redirect: "false"
            })
        }
    }



    /**
* render layout based on user level
* */
    render() {
        var dashboards = this.state.dashboards;

        //loading screen span
        var loadingScreen = <span>
            <Notificationbar className="errorBarLoading"></Notificationbar>
            <div style={{ "marginTop": (window.innerHeight / 2) - 50 }} className=" align-items-center justify-content-center">
                <div className="loaderr">
                    <div className="bar"></div>
                </div>
                {this.state.logo && <div><img src={this.state.logo} alt="logo" style={{ "marginLeft": "40%", "width": "300px" }} /></div>}
            </div>
        </span>

        //get userto display
        var sipUser = storePersistent.getState().user;
        if (sipUser) {
            if (storePersistent.getState().user.aws === false) {
                sipUser = "Account: " + storePersistent.getState().user.username;
            }
            else {
                sipUser = storePersistent.getState().user.email ? storePersistent.getState().user.user + ": " + storePersistent.getState().user.email : storePersistent.getState().user.username ? storePersistent.getState().user.user + " " + storePersistent.getState().user.username : storePersistent.getState().user.user;
            }
        } else {
            sipUser = "";
        }



        var sipUserSwitch;
        const aws = this.state.aws;
        var url = window.location.pathname;
        var style = aws || sipUser.jwt !== 0 ? "" : { "paddingBottom": "7px", "paddingLeft": "7px" };

        if (storePersistent.getState().user) {
            style = storePersistent.getState().user.jwt === 0 ? { "paddingBottom": "7px", "paddingLeft": "7px" } : style;
        }
        //show just diagram
        if (this.state.dashboards.length > 0) {
            if ((aws === false || this.state.admin || this.state.siteAdmin) && url.includes("sequenceDiagram")) {
                sipUserSwitch = <div className="row"
                    id="body-row">
                    <Switch>
                        <Route path='/sequenceDiagram/:id' render={() => < Sequence />} />
                        <Route path='/sequenceDiagram/' render={() => < Sequence />} />
                    </Switch>
                </div>

                //ADMIN ROLE: show everything
            } else if (aws === false || this.state.admin || this.state.siteAdmin) {
                console.info("Router: admin mode");
                var dashboardAlter = [...this.state.dashboards];
                if (this.state.aws) {
                    dashboardAlter.push("tenant");
                    dashboardAlter.push("connectivityIP");
                }

                var styleUser = { "display": "inline", "paddingTop": "7px", "position": "absolute" };
                if (storePersistent.getState().user && storePersistent.getState().user.jwt === 0) {
                    styleUser = { "display": "inline" };
                }

                //admin context
                sipUserSwitch = <div className="row" id="body-row" >
                    <NavBar redirect={this.redirect} toggle={this.toggle} aws={this.state.aws} dashboardsUser={this.state.dashboardsUser} dashboards={this.state.dashboards} dashboardsSettings={this.state.dashboardsSettings} />
                    <div className="row justify-content-between header" style={{ "marginRight": 0, "marginLeft": 0 }} >
                        <span id="user" className="top" style={{ style }}>
                            {aws === true && <DecryptPasswordPopup />}
                            <div style={styleUser}>{sipUser}</div>
                            {aws === true && (!this.state.admin && !this.state.siteAdmin) && <a href="/logout" > Log out </a>}
                        </span>

                        <TimerangeBar />
                    </div>

                    <div id="context" className={"margin250"}>
                        <Notificationbar className="errorBar"></Notificationbar>
                        <div className="row">
                            <Switch >
                                {paths(dashboardAlter, this.state.tags, this.state.hostnames, this.state.dstRealms, this.state.srcRealms)}
                                {paths(this.state.dashboardsSettings, this.state.tags, this.state.hostnames, this.state.dstRealms, this.state.srcRealms)}
                                {paths(this.state.dashboardsUser, this.state.tags, this.state.hostnames, this.state.dstRealms, this.state.srcRealms)}
                                {aws && <Route path="/logout" />}
                                {aws && <Route path="/passwdd" />}
                                <Redirect to={dashboards.includes("home") ? "/home" : "/" + dashboards[0]} />
                            </Switch>
                        </div>
                        <span className="footer" style={{ "float": "right" }}>
                            <img src={this.state.logo} alt="logo" id="footerlogo" />
                            <div>{this.state.monitorName}</div>
                        </span>
                    </div>
                </div>;
            }
            //END USER ROLE: show one limited dashboard
            else {
                console.info("Router: end user mode");
                //end user context
                sipUserSwitch = <div className="row"
                    id="body-row">
                    <div className="col" >
                        <div className="d-flex justify-content-between header" >
                            <span id="user" className="top">
                                {aws === true && <DecryptPasswordPopup />}
                                {sipUser}
                                {aws === true && !this.state.admin && <a href="/logout"> Log out </a>}</span>
                            <TimerangeBar />
                        </div>
                        <FilterBar redirect={this.state.redirect} />
                        <Notificationbar className="errorBarLoading" ></Notificationbar>
                        <div>
                            <Switch >
                                <Route exact path='/index' render={() => < Restricted name="restricted" tags={this.state.tags} />} />
                                <Route exact path='/' render={() => < Restricted name="restricted" />} />
                                <Route path='/logout' />
                                <Route path='/no-sip-identity/' />
                                <Route path='/sequenceDiagram/:id' render={() => < Sequence />} />
                                <Route path='/sequenceDiagram/' render={() => <Sequence />} />
                                <Redirect to="/" />
                            </Switch>
                            <span className="footer" style={{ "float": "right" }}>
                                <img src={this.state.logo} alt="logo" id="footerlogo" />
                                <div>{this.state.monitorName}</div>
                            </span>
                        </div>
                    </div>
                </div>;
            }
        }
        return (
            <span>
                <span id="decryptpopupplaceholder"></span>
                <Popup></Popup>

                {this.state.firstTimeLogin ? <FirstLoginPopup setFirstTimeLogin={this.setFirstTimeLogin} /> :
                    (this.state.isLoading) ? loadingScreen :
                        <Router basename={BASE_NAME+"/"}>
                            <div className="container-fluid" style={{ "backgroundColor": "white" }}> {sipUserSwitch}
                            </div>
                        </Router>
                }
            </span>
        );
    }
}

export default App;

