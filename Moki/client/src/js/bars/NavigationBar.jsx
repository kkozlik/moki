import React, {
    Component
} from 'react';
import { Link } from 'react-router-dom';
import logoutIcon from "../../styles/icons/log_out.png";
import password from "../../styles/icons/password.png";
import store from "../store/index";
import { setWidthChart } from "../actions/index";
import collapseIcon from "../../styles/icons/collapse.png";
import { renderNavBar, logout } from '@moki-client/gui';
import storePersistent from "../store/indexPersistent";

class navBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            dashboards: this.props.dashboards,
            dashboardsSettings: this.props.dashboardsSettings,
            dashboardsUser: this.props.dashboardsUser

        };
        this.togglebar = this.togglebar.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dashboards !== this.props.dashboards) {
            this.setState({ dashboards: nextProps.dashboards });
        }
        if (nextProps.dashboardsSettings !== this.props.dashboardsSettings) {
            this.setState({ dashboardsSettings: nextProps.dashboardsSettings });
        }
        if (nextProps.dashboardsUser !== this.props.dashboardsUser) {
            this.setState({ dashboardsUser: nextProps.dashboardsUser });
        }

    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        var navBar = document.getElementById("sidebar-container");
        if (navBar.clientHeight < window.innerHeight) {
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
            else if (window.pageYOffset > 300) {
                navBar.style.position = "sticky";
                navBar.style.bottom = "auto";
                navBar.style.top = "0";
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


    changepassword() {
        async function checkPassword() {
            document.getElementById("createR").style.display = "none";
            document.getElementById("create").style.display = "block";

            var password = document.getElementById("password").value;
            //password length > 8
            if (password.length < 8) {
                window.mainPopup.error("Password must have at least 8 characters.");
            }
            else {
                try {
                    var response = await fetch("/api/user/create", {
                        method: "POST",
                        credentials: 'include',
                        body:
                            JSON.stringify({
                                name: storePersistent.getState().user.user,
                                password: password
                            }),
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Credentials": "include"
                        }
                    })

                    if (response.status !== 200) {
                        window.mainPopup.error("Problem to create user.");
                    }
                    var res = await response.json();
                    if (res.error) {
                        window.mainPopup.error(res.error);
                    }
                    else {
                        //ok
                        window.mainPopup.reset();
                    }
                }
                catch (error) {
                    window.mainPopup.error(error);
                }
            }

            document.getElementById("createR").style.display = "block";
            document.getElementById("create").style.display = "none";
        }


        var changePasswordForm = <span>
            <h3 style={{ "marginBottom": "15px" }}>Set a new password with at least 8 characters:</h3>
            <input type="password" id="password" class="form-control" placeholder="password"></input>
            <div style={{ "textAlign": "end" }}>
                <button style={{ "marginRight": "5px", "marginTop": "10px" }} className="btn btn-secondary" onClick={window.mainPopup.storno}>Storno </button>
                <button style={{ "marginRight": "5px", "marginTop": "10px" }} className="btn btn-primary" onClick={() => checkPassword()}><i class="fa fa-circle-o-notch fa-spin" id="create" style={{ "display": "none" }}></i> <span id="createR">Change</span> </button>
            </div>

        </span>

        window.mainPopup.setPopup("visible", changePasswordForm);
    }

    render() {
        var dashboardsSettings = this.state.dashboardsSettings;
        var dashboards = this.state.dashboards;
        var navbar = renderNavBar(dashboards);
        var navbarSettings = renderNavBar(dashboardsSettings);

        //remove logout and changePassword, it's not dashboard, just link
        var userDash = [...this.state.dashboardsUser];
        if(userDash.indexOf("logout") !== -1) userDash.splice(userDash.indexOf("logout"), 1);
        if(userDash.indexOf("changePassword") !== -1) userDash.splice(userDash.indexOf("changePassword"), 1);
        var navbarUser = renderNavBar(userDash);

        return (
            <div id="sidebar-container" className="sidebar-expanded d-none d-md-block">
                <ul className="list-group">
                    <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed" style={{ "height": "38px" }}>
                        <small className="menu-collapsed">DASHBOARDS</small>
                    </li>
                    {navbar}
                    {navbarSettings.length > 0 && <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">
                    </li>}
                    {navbarSettings}

                    <li className="list-group-myitem sidebar-separator-title d-flex align-items-center menu-collapsed">

                    </li>

                    {navbarUser}
                    {this.state.dashboardsUser.includes("logout") && <Link to={this.props.aws === true ? "/logout" : "/"} className="bg-dark list-group-myitem list-group-item-action" onClick={logout}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={logoutIcon} alt="transport" />
                            <span className="menu-collapsed menuText">Log out</span>
                        </div>
                    </Link>
                    }
                    {this.state.dashboardsUser.includes("changePassword") && <button className="noFormatButton bg-dark list-group-collaps list-group-item-action d-flex align-items-center" onClick={this.changepassword}>
                        <div className="d-flex w-100 justify-content-start align-items-center">
                            <img className="marginRight" src={password} alt="transport" />
                            <span className="menu-collapsed menuText" style={{ "color": "white" }}>Change password</span>
                        </div>
                    </button>
                    }
                    <button onClick={this.togglebar} data-toggle="sidebar-colapse" className="noFormatButton bg-dark list-group-collaps list-group-item-action d-flex align-items-center" >
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
