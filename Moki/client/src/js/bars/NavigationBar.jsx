import React, {
    Component
} from 'react';
import { Link } from 'react-router-dom';
import logout from "../../styles/icons/log_out.png";
import store from "../store/index";
import { setWidthChart } from "../actions/index";
import collapseIcon from "../../styles/icons/collapse.png";
import { renderNavBar } from '@moki-client/gui';

class navBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            dashboards: this.props.dashboards,
            dashboardsSettings: this.props.dashboardsSettings

        };
        this.togglebar = this.togglebar.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dashboards !== this.props.dashboards) {
            this.setState({ dashboards: nextProps.dashboards });
        }
        if (nextProps.dashboardsSettings !== this.props.dashboardsSettings) {
            this.setState({ dashboardsSettings: nextProps.dashboardsSettings });
        }

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

    togglebar() {
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

    render() {
        var dashboardsSettings = this.state.dashboardsSettings;
        var dashboards = this.state.dashboards;
        var navbar = renderNavBar(dashboards);
        var navbarSettings = renderNavBar(dashboardsSettings);
        return (
            <div id="sidebar-container" className="sidebar-expanded d-none d-md-block sticky-top">
                <ul className="list-group">
                    <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">
                        <small className="menu-collapsed">DASHBOARDS</small>
                    </li>
                    {navbar}
                    {<li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">

                        <small className="menu-collapsed">SETTINGS</small>
                    </li>}
                    {navbarSettings}

                    <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">
                        <small className="menu-collapsed">USER</small>
                    </li>
                    <Link to={this.props.aws === true ? "/logout" : "/"} className="bg-dark list-group-myitem list-group-item-action" onClick={this.logout}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={logout} alt="transport" />
                            <span className="menu-collapsed menuText">Log out</span>
                        </div>
                    </Link>
                    <button  onClick={this.togglebar} data-toggle="sidebar-colapse" className="noFormatButton bg-dark list-group-collaps list-group-item-action d-flex align-items-center" >
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={collapseIcon} alt="collapse" />
                            <span id="collapse-text" className="menu-collapsed">Collapse</span>
                        </div>
                    </button>

                </ul>

            </div>

        );
    }
}

export default navBar;
