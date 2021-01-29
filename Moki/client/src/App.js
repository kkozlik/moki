import React, {
    Component
} from 'react';
import './App.css';
import Calls from './js/dashboards/Call/Calls';
import Web from './js/dashboards/Web/Web';
import Connectivity from './js/dashboards/Connectivity/Connectivity';
import Exceeded from './js/dashboards/Exceeded/Exceeded';
import Security from './js/dashboards/Security/Security';
import Transport from './js/dashboards/Transport/Transport';
import Microanalysis from './js/dashboards/Microanalysis/Microanalysis';
import Diagnostics from './js/dashboards/Diagnostics/Diagnostics';
import Registration from './js/dashboards/Registration/Registration';
import Overview from './js/dashboards/Overview/Overview';
import Network from './js/dashboards/Network/Network';
import System from './js/dashboards/System/System';
import QoS from './js/dashboards/QoS/QoS';
import Home from './js/dashboards/Home/Home';
import Domains from './js/dashboards/Domains/Domains';
import Conference from './js/dashboards/Conference/Conference';
import Realm from './js/dashboards/Realm/Realm';
import Monitoring from './js/dashboards/Monitoring/Monitoring';
import ConnectivityCA from './js/dashboards/ConnectivityCA/ConnectivityCA';
import NavBar from './js/bars/NavigationBar';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';
import TimerangeBar from './js/bars/SetTimerangeBar';
import FilterBar from './js/bars/FilterBar';
import Restricted from './js/dashboards/Restricted/Restricted';
import Alarms from './js/pages/alarms_settings';
import SNS from './js/pages/sns_settings';
import Sequence from './js/pages/sequenceDiagram';
import General from './js/pages/general_settings';
import store from "./js/store/index";
import {
    setUser
} from "./js/actions/index";
import {
    setWidthChart
} from "./js/actions/index";
import { Redirect } from 'react-router';

class App extends Component {
    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            error: "",
            redirect: false,
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
            dashboardsSettings: [],
            logo: ""
        }
        this.showError = this.showError.bind(this);
        this.redirect = this.redirect.bind(this);
        this.getHostnames = this.getHostnames.bind(this);
        this.getTags = this.getTags.bind(this);
        this.getSipUser();
    }

    componentDidMount() {
        //check if needed to display an error
        this.showError(this.state.error);
        //resize window function
        window.addEventListener('resize', this.windowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResize);
      }

    //get monitor name
    async getMonitorName() {
        //get monitor version
        var url = "/api/monitor/version";
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
            monitorVersion = monitorVersion.version;
        } catch (error) {
            console.error(error);
        }

        //get monitor name stored in m_config
        url = "/api/setting";
        var jsonData;
        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            jsonData = await response.json();
            var result = [];
            jsonData.forEach(data => {
                if (data.app === "m_config")
                    result = data.attrs;

                //get monitor defaults settings (logo, colors, dashboards)
                if (data.app === "m_settings") {
                    for (var j = 0; j < data.attrs.length; j++) {
                        if (data.attrs[j].attribute === "logo") {
                            this.getLogo(data.attrs[j].value);
                        }
                        if (data.attrs[j].attribute === "dashboards") {

                            //admin and aws: show also web and domain dashboards
                            if (this.state.admin && this.state.aws) {
                                this.setState({
                                    dashboards: ["calls", "conference", "connectivityCA", "connectivity", "diagnostics", "domains", "exceeded", "home", "microanalysis", "network", "overview", "qos", "realm", "registration", "security", "system", "transport", "web"]
                                });
                            }
                            //admin and not aws: show all dashboard except web and domain
                            else if (this.state.admin && !this.state.aws) {
                                this.setState({
                                    dashboards: ["calls", "conference", "connectivityCA", "connectivity", "diagnostics", "exceeded", "home", "microanalysis", "network", "overview", "qos", "realm", "registration", "security", "system", "transport"]
                                });
                            }
                            //user level, show only what is set in config
                            else {
                                this.setState({
                                    dashboards: data.attrs[j].value
                                });
                            }

                        }
                        if (data.attrs[j].attribute === "settings") {
                            if (this.state.admin) {
                                this.setState({
                                    dashboardsSettings: ["alarms", "sns", "general", "monitoring"]
                                });
                            }
                            else {
                                this.setState({
                                    dashboardsSettings: data.attrs[j].value
                                });
                            }
                        }
                        if (data.attrs[j].attribute === "color") {
                            //set main color
                            document.body.style.setProperty('--main', data.attrs[j].value);
                        }

                    }
                }
            });

            for (var i = 0; i < result.length; i++) {
                if (result[i].attribute === "monitor_name") {
                    if (result[i].value) {
                        this.setState({
                            monitorName: result[i].value + " " + monitorVersion
                        });
                        document.title = result[i].value;
                    }
                }
            }

        } catch (error) {
            console.error(error);
            //alert("Problem with receiving data. " + error.responseText.message);
        }

    }

    //get logo img
    async getLogo(path) {
        //get monitor version
        var url = "/api/monitor/logo";
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
            this.setState({ logo: "data:;base64," + base64 });
        } catch (error) {
            console.error(error);
        }
    }

    //get hostnames list to set colors
    async getTags() {
        const request = async () => {
            const response = await fetch("/api/tags", {
                method: "GET",
                timeout: 10000,
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            const json = await response.json();
            //get tags
            if (json.responses && json.responses[0] && json.responses[0].aggregations && json.responses[0].aggregations.distinct && json.responses[0].aggregations.distinct.buckets) {
                //if tags is array split it
                var tags = [];
                for (var i = 0; i < json.responses[0].aggregations.distinct.buckets.length; i++) {
                    if (Array.isArray(json.responses[0].aggregations.distinct.buckets[i].key)) {
                        tags.push(json.responses[0].aggregations.distinct.buckets[i].key.slice());
                    } else {
                        tags.push(json.responses[0].aggregations.distinct.buckets[i].key);
                    }

                }
                this.setState({
                    tags: tags,
                    tagsFull: json.responses[0].aggregations.distinct.buckets
                });
            }
        }
        request();
    }

    //get hostnames, realms list to set colors and tag list
    async getHostnames() {
        const request = async () => {
            const response = await fetch("/api/hostnames", {
                method: "GET",
                timeout: 10000,
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });


            const json = await response.json();

            var hostnames = [];
            var hostnamesColor = [];

            if (json.responses && json.responses[0] && json.responses[0].aggregations && json.responses[0].aggregations.distinct && json.responses[0].aggregations.distinct.buckets) {
                hostnames = json.responses[0].aggregations.distinct.buckets;
                var colors = ["#caa547", "#30427F", "#697F30", "#ca8b47", "#0a3f53", "#4d8296", "#58a959", "#A5CA47", "#5b67a4", "#121e5b", "#efcc76", "#3c488a", "#844a0b", "#efb576"]
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

        request();
    }

    //change charts width if windows width changes 
    windowResize() {
        if(window.innerWidth !== store.getState().width ) store.dispatch(setWidthChart(window.innerWidth));
  }
  
    //get sip user
    async getSipUser() {
        var response = "";
        try {
            var sip;
            response = await fetch("/api/user/sip", {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                "Access-Control-Allow-Credentials": "include"
            });
            if (!response.ok) {
                this.showError("Monitor server is not running.");
            }
            else {
                sip = await response.json();

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
                    store.dispatch(setUser(sip));
                    //set admin
                    if (sip.user === "ADMIN" && sip.user !== "SITE ADMIN") {
                        this.setState({
                            admin: true
                        })
                    }
                    if (sip.user === "SITE ADMIN" || sip.user === "DEFAULT") {
                        this.setState({
                            siteAdmin: true
                        })
                    }
                    //wrong pass
                    if (sip && sip.user && sip.user !== "redirect") {
                        this.setState({
                            isLoading: false
                        })
                    }

                    //default user: no need to log in for web
                    if (sip.user !== "DEFAULT") {
                        this.getMonitorName();
                        this.getHostnames();
                    }
                    else {
                        this.setState({
                            dashboards: ["web"]
                        });
                    }
                }
            }
        } catch (error) {
            if (response.status === 500) {
                this.setState({ error: "Monitor server is not running." });
            } else {
                console.error(error);
                this.setState({ error: "Check elasticsearch connection and restart the page." });
            }
        }
    }

    showError(error) {
        if (error !== "" && document.getElementsByClassName("errorBar").length > 0) {
            document.getElementsByClassName("errorBar")[0].style.visibility = "visible";
            this.setState({
                error: error
            })

            setTimeout(function () {
                this.setState({
                    error: ""
                });
                document.getElementsByClassName("errorBar")[0].style.visibility = "hidden";
            }.bind(this), 10000); // wait 10 seconds, then reset to false
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


    render() {
        var dashboards = this.state.dashboards;
        var dashboardsSettings = this.state.dashboardsSettings;
        var loadingScreen = <span> <div className="errorBar" > {
            this.state.error
        } </div> <div style={
            {
                "marginTop": (window.innerHeight / 2) - 50
            }
        }
            className="row align-items-center justify-content-center"> <div className="loader" /> {this.state.logo && <img src={
                this.state.logo
            }
                alt="logo"
                style={
                    {
                        "marginLeft": 10
                    }
                }
            />}</div></span>

        var sipUser = store.getState().user;
        if (store.getState().user) {
            sipUser = store.getState().user.name ? store.getState().user.user + ": " + store.getState().user.name : store.getState().user.user;
        } else {
            sipUser = "";
        }

        var sipUserSwitch;
        const aws = this.state.aws;
        var url = window.location.pathname;
        if (this.state.dashboards.length > 0) {
            if ((aws === false || this.state.admin || this.state.siteAdmin) && url.includes("sequenceDiagram")) {
                sipUserSwitch = <div className="row"
                    id="body-row">
                    <Switch>
                        <Route path='/sequenceDiagram/:id' render={() => < Sequence />} />
                        <Route path='/sequenceDiagram/' render={() => < Sequence />} />
                    </Switch>
                </div>

            } else if (aws === false || this.state.admin || this.state.siteAdmin) {
                sipUserSwitch = <div className="row"
                    id="body-row" >
                    <NavBar redirect={this.redirect} toggle={this.toggle} aws={this.state.aws} dashboards={this.state.dashboards} dashboardsSettings={this.state.dashboardsSettings} />

                    <div id="context"
                        className={
                            "margin250"
                        } >
                        <div className="row" >
                            <div className="errorBar" > {this.state.error} </div>
                        </div>
                        <div className="row justify-content-between" >
                            <span id="user"
                                className="tab top" > {
                                    sipUser
                                } {
                                    aws === true && (!this.state.admin && !this.state.siteAdmin) && < a href="/logout" > Log out </a>}</span>
                            <span id="monitorName"
                                className="tab top monitorName" > {
                                    this.state.monitorName.toUpperCase()
                                } </span> <TimerangeBar showError={
                                    this.showError
                                } /> </div>
                        <div className="row" >
                            <Switch >
                                {dashboards.includes("calls") && <Route exact path='/calls'
                                    render={
                                        () => <Calls tags={
                                            this.state.tags
                                        }
                                            name="calls"
                                            showError={
                                                this.showError
                                            }
                                        />} />
                                }
                                <Route exact path='/web'
                                    render={
                                        () => <Web tags={
                                            this.state.tags
                                        }
                                            name="web"
                                            showError={
                                                this.showError
                                            }
                                        />} />

                                {dashboards.includes("overview") && <Route exact path='/overview'
                                    render={
                                        () => < Overview name="overview"
                                            showError={
                                                this.showError
                                            }
                                            tags={
                                                this.state.tags
                                            }
                                        />} />
                                }
                                {dashboards.includes("home") && <Route exact path='/home'
                                    render={
                                        () => < Home name="home"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("conference") && <Route exact path='/conference'
                                    render={
                                        () => < Conference name="conference"
                                            showError={
                                                this.showError
                                            }
                                            tags={
                                                this.state.tags
                                            }
                                        />} />
                                }

                                {dashboards.includes("diagnostics") && <Route exact path='/diagnostics'
                                    render={
                                        () => < Diagnostics name="diagnostics"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("registration") && <Route exact path='/registration'
                                    render={
                                        () => < Registration name="registration"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("qos") && <Route exact path='/qos'
                                    render={
                                        () => < QoS name="qos"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.props.tags}
                                        />} />
                                }
                                {dashboards.includes("microanalysis") && <Route exact path='/microanalysis'
                                    render={
                                        () => < Microanalysis name="microanalysis"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("domains") && <Route exact path='/domains'
                                    render={
                                        () => < Domains name="domains"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("security") && <Route exact path='/security'
                                    render={
                                        () => < Security name="security"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("transport") && <Route exact path='/transport'
                                    render={
                                        () => < Transport name="transport"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboardsSettings.includes("monitoring") && <Route exact path='/monitoring'
                                    render={
                                        () => < Monitoring name="monitoring"
                                            showError={
                                                this.showError
                                            }
                                        />} />
                                }
                                {dashboards.includes("connectivityCA") && <Route exact path='/connectivityCA'
                                    render={
                                        () => < ConnectivityCA name="ConnectivityCA"
                                            showError={
                                                this.showError
                                            }
                                            dstRealms={
                                                this.state.dstRealms
                                            }
                                            srcRealms={
                                                this.state.srcRealms
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("exceeded") && <Route exact path='/exceeded'
                                    render={
                                        () => < Exceeded name="exceeded"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboards.includes("network") && <Route exact path='/network'
                                    render={
                                        () => < Network name="network"
                                            showError={
                                                this.showError
                                            }
                                            hostnames={
                                                this.state.hostnames
                                            }
                                        />} />
                                }
                                {dashboards.includes("system") && <Route exact path='/system'
                                    render={
                                        () => < System name="system"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                            hostnames={
                                                this.state.hostnames
                                            }
                                        />} />
                                }
                                {dashboards.includes("connectivity") && <Route exact path='/connectivity'
                                    render={
                                        () => < Connectivity name="connectivity"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />

                                }
                                {dashboards.includes("realm") && <Route exact path='/realm'
                                    render={
                                        () => < Realm name="realm"
                                            showError={
                                                this.showError
                                            }
                                            hostnames={
                                                this.state.hostnames
                                            }
                                            tags={this.state.tags}
                                        />} />
                                }
                                {dashboardsSettings.includes("alarms") && <Route exact path='/alarms'
                                    render={
                                        () => < Alarms />
                                    }
                                />
                                }
                                {dashboardsSettings.includes("sns") && <Route exact path='/sns'
                                    render={
                                        () => < SNS />
                                    }
                                />
                                }
                                {dashboardsSettings.includes("general") && <Route exact path='/general'
                                    render={
                                        () => < General tags={
                                            this.state.tagsFull
                                        }
                                            getTags={
                                                () => this.getTags()
                                            }
                                        />} />
                                }
                                {aws && <Route path="/logout" />}
                                {aws && <Route path="/passwdd" />}
                                <Redirect to={dashboards.includes("home") ? "/home" : "/" + dashboards[0]} />
                            </Switch>
                        </div>
                        <img src={
                            this.state.logo
                        }
                            alt="logo"
                            style={
                                {
                                    "float": "right",
                                    "height": "20px"
                                }
                            }
                        />
                    </div>

                </div>;
            }
            else {
                sipUserSwitch = <div className="row"
                    id="body-row">
                    <div className="col" >
                        <div className="row" >
                            <div className="errorBar" > {
                                this.state.error
                            }

                            </div> </div> <div class="d-flex justify-content-between" >
                            <span id="user"
                                className="tab top"> {
                                    sipUser
                                } {
                                    aws === true && !this.state.admin && <a href="/logout"> Log out </a>}</span> <
                                        span id="monitorName"
                                        className="tab top monitorName"> {
                                    this.state.monitorName.toUpperCase()
                                } </span> <
                                TimerangeBar showError={
                                    this.showError
                                }
                            />


                        </div>

                        <FilterBar redirect={
                            this.state.redirect
                        }
                        />

                        <div>
                            <Switch >
                                <Route exact path='/index'
                                    render={
                                        () => < Restricted name="restricted"
                                            showError={
                                                this.showError
                                            }
                                            tags={this.state.tags}
                                        />} />
                                <Route exact path='/'
                                    render={
                                        () => < Restricted name="restricted"
                                            showError={
                                                this.showError
                                            }
                                        />} />

                                <Route path='/logout' />
                                <Route path='/no-sip-identity/' />
                                <Route path='/sequenceDiagram/:id' render={() => < Sequence />} />
                                <Route path='/sequenceDiagram/' render={() => <Sequence />} />
                                <Redirect to="/" />
                            </Switch> <img src={
                                this.state.logo
                            }
                                alt="logo"
                                style={
                                    {
                                        "float": "right",
                                        "height": "20px"
                                    }
                                }
                            />
                        </div> </div> </div>;
            }
        }
        return (
            (this.state.isLoading && this.state.dashboards.length === 0) ? loadingScreen :
                    <Router>
                        <div className="container-fluid"> {
                            sipUserSwitch
                        }
                        </div>
                    </Router>

        );
    }
}

//        <Redirect to='/index' />

export default App;
