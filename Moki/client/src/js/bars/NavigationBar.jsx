import React, {
    Component
} from 'react';
import { Link } from 'react-router-dom';
import callsIcon from "../../styles/icons/calls.png";
import connectivityCA from "../../styles/icons/connectivityCA.png";
import connectivity from "../../styles/icons/connectivity.png";
import conference from "../../styles/icons/conference.png";
import diagnostic from "../../styles/icons/diagnostic.png";
import exceeded from "../../styles/icons/exceeded.png";
import home from "../../styles/icons/home.png";
import settings from "../../styles/icons/settings.png";
import domains from "../../styles/icons/domains.png";
import microanalysis from "../../styles/icons/microanalysis.png";
import network from "../../styles/icons/network.png";
import overview from "../../styles/icons/overview.png";
import qos from "../../styles/icons/qos.png";
import realm from "../../styles/icons/realm.png";
import password from "../../styles/icons/password.png";
import registration from "../../styles/icons/registration.png";
import monitoring from "../../styles/icons/monitoring.png";
import security from "../../styles/icons/security.png";
import system from "../../styles/icons/system.png";
import transport from "../../styles/icons/transport.png";
import sns from "../../styles/icons/sns.png";
import logout from "../../styles/icons/log_out.png";
import store from "../store/index";
import { setWidthChart } from "../actions/index";
import Popup from "reactjs-popup";
import collapseIcon from "../../styles/icons/collapse.png";

class navBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            activeDashboard: ""
        };
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.redirect = this.redirect.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        var navBar = document.getElementById("sidebar-container");
        if(navBar.clientHeight < window.innerHeight){
            navBar.style.position = "fixed";
            navBar.style.top = "0";
            navBar.style.bottom = "auto";

        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll(event) {
        var navBar = document.getElementById("sidebar-container");
        if (navBar.clientHeight - window.innerHeight > 0) {
            if (window.pageYOffset > (navBar.clientHeight - window.innerHeight)) {
                navBar.style.position = "fixed";
                navBar.style.bottom = "0";
                navBar.style.top = "auto";
            }
            else {
                navBar.style.position = "sticky";
                navBar.style.bottom = "auto";
                navBar.style.top = "0";
            }
        }

    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
        var collapsedItems = document.getElementsByClassName(" menu-collapsed");
        if (!this.state.collapsed) {
            for (var i = 0; i < collapsedItems.length; i++) {
                collapsedItems[i].style.display = "none";
            }

            var collapsedItemBar = document.getElementsByClassName("sidebar-expanded");
            collapsedItemBar[0].className = "sidebar-collapsed d-md-block";
            store.dispatch(setWidthChart(window.innerWidth + 150));
            document.getElementsByClassName("margin250")[0].className = "margin70";
        }
        else {
            for (i = 0; i < collapsedItems.length; i++) {
                collapsedItems[i].style.display = "block";
            }

            collapsedItemBar = document.getElementsByClassName("sidebar-collapsed");
            collapsedItemBar[0].className = "sidebar-expanded d-md-block";

            store.dispatch(setWidthChart(window.innerWidth));
            document.getElementsByClassName("margin70")[0].className = "margin250";

        }

    }

    logout() {
        if (!this.props.aws) {
            try {
                fetch("/", {
                    credentials: 'include',
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Basic nouser",
                        "Access-Control-Allow-Credentials": "include"
                    }
                });
                window.location.reload();
            }
            catch (error) {
            }
        }
        else {
            window.location.href = "/logout";
        }
    }

    redirect(event) {

        //toggle active dashboards
        var newDashboard = event.currentTarget.getElementsByTagName("span")[0];
        this.setState({
            activeDashboard: newDashboard.innerHTML
        });

        // this.props.redirect();
    }


    render() {
        var dashboards = this.props.dashboards;
        var dashboardsSettings = this.props.dashboardsSettings;
        return (
            <div id="sidebar-container" className="sidebar-expanded d-none d-md-block sticky-top">
                <ul className="list-group">
                    <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">
                        <small className="menu-collapsed">DASHBOARDS</small>
                    </li>
                    {dashboards.includes("calls") && <Link to={"/calls"} id="/calls" className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img src={callsIcon} alt="calls" className="marginRight" title="CALLS" />
                            <span className={this.state.activeDashboard === "Calls" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Calls</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("conference") && <Link to={"/conference"} id="/conference" className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={conference} alt="conference" title="CONFERENCE" />
                            <span className={this.state.activeDashboard === "Conference" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Conference</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("connectivityCA") && <Link to={"/connectivityCA"} id={"/connectivityCA"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={connectivityCA} alt="connectivityCA" title="CONNECTIVITY CA" />
                            <span className={this.state.activeDashboard === "Connectivity CA" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Connectivity CA</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("connectivity") && <Link to={"/connectivity"} id={"/connectivity"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={connectivity} alt="connectivity" title="CONNECTIVITY" />
                            <span className={this.state.activeDashboard === "Connectivity" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Connectivity</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("diagnostics") && <Link to={"/diagnostics"} id={"/diagnostics"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={diagnostic} alt="diagnostics" title="DIAGNOSTICS" />
                            <span className={this.state.activeDashboard === "Diagnostics" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Diagnostics</span>
                        </div>
                    </Link>
                    }
                     {dashboards.includes("domains") && <Link to={"/domains"} id={"/domains"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={domains} alt="domains" title="DOMAINS" />
                            <span className={this.state.activeDashboard === "Domains" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Domains</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("exceeded") && <Link to={"/exceeded"} id={"/exceeded"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={exceeded} alt="exceeded" title="EXCEEDED" />
                            <span className={this.state.activeDashboard === "Exceeded limits" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Exceeded limits</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("home") && <Link to={"/home"} id={"/home"} className="bg-dark list-group-myitem list-group-item-action activeDashboard" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={home} alt="home" title="HOME" />
                            <span className={this.state.activeDashboard === "Home" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Home</span>
                        </div>
                    </Link>
                    }

                    {dashboards.includes("microanalysis") && <Link to={"/microanalysis"} id={"/microanalysis"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={microanalysis} alt="micronalysis" title="MICROANALYSIS" />
                            <span className={this.state.activeDashboard === "Microanalysis" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Microanalysis</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("network") && <Link to={"/network"} id={"/network"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={network} alt="network" title="NETWORK" />
                            <span className={this.state.activeDashboard === "Network" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Network</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("overview") && <Link to={"/overview"} id={"/overview"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={overview} alt="overview" title="OVERVIEW" />
                            <span className={this.state.activeDashboard === "Overview" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Overview</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("qos") && <Link to={"/qos"} id={"/qos"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={qos} alt="qos" title="QoS" />
                            <span className={this.state.activeDashboard === "QoS" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>QoS</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("realm") && <Link to={"/realm"} id={"/realm"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={realm} alt="realm" title="REALM" />
                            <span className={this.state.activeDashboard === "Realm" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Realm</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("registration") && <Link to={"/registration"} id={"/registration"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={registration} alt="registration" title="REGISTRATION" />
                            <span className={this.state.activeDashboard === "Registration" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Registration</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("security") && <Link to={"/security"} id={"/security"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={security} alt="security" title="SECURITY" />
                            <span className={this.state.activeDashboard === "Security" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Security</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("system") && <Link to={"/system"} id={"/system"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={system} alt="system" title="SYSTEM" />
                            <span className={this.state.activeDashboard === "System" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>System</span>
                        </div>
                    </Link>
                    }
                    {dashboards.includes("transport") && <Link to={"/transport"} id={"/transport"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={transport} alt="transport" title="TRANSPORT" />
                            <span className={this.state.activeDashboard === "Transport" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Transport</span>
                        </div>
                    </Link>
                    }
                    {dashboardsSettings.length !== 0 && <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">

                        <small className="menu-collapsed">SETTINGS</small>
                    </li>}
                    {dashboardsSettings.includes("alarms") && <Link to={"/alarms"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={exceeded} alt="alarms" />
                            <span className={this.state.activeDashboard === "Logstash" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Alarms</span>
                        </div>
                    </Link>
                    }
                    {dashboardsSettings.includes("sns") && <Link to={"/sns"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={sns} alt="sns" />
                            <span className={this.state.activeDashboard === "SNS" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>SNS</span>
                        </div>
                    </Link>
                    }
                    {dashboardsSettings.includes("general") && <Link to={"/general"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={settings} alt="general" />
                            <span className={this.state.activeDashboard === "general" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>General</span>
                        </div>
                    </Link>
                    }
                    {dashboardsSettings.includes("monitoring") && <Link to={"/monitoring"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.redirect}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={monitoring} alt="monitoring" />
                            <span className={this.state.activeDashboard === "Monitoring" ? "menu-collapsed menuText activeDashboard" : "menu-collapsed menuText"}>Monitoring</span>
                        </div>
                    </Link>
                    }

                    <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">
                        <small className="menu-collapsed">USER</small>
                    </li>
                    <Link to={this.props.aws === true ? "/logout" : "/"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.logout}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={logout} alt="transport" />
                            <span className="menu-collapsed menuText">Log out</span>
                        </div>
                    </Link>
                    <a onClick={this.toggleNavbar} data-toggle="sidebar-colapse" className="bg-dark list-group-collaps list-group-item-action d-flex align-items-center" >
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={collapseIcon} alt="collapse" />
                            <span id="collapse-text" className="menu-collapsed">Collapse</span>
                        </div>
                    </a>

                </ul>

            </div>

        );
    }
}

export default navBar;
