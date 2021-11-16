import React, { Component } from 'react';

export default class FirstLoginPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: ""
        };
        this.createUser = this.createUser.bind(this);
    }

    async createUser() {
        this.setState({ "error": "" });
        document.getElementById("createR").style.display = "none";
        document.getElementById("create").style.display = "block";

        var password = document.getElementById("password").value;
        //password length > 8
        if (password.length < 8) {
            this.setState({ "error": "Password must have at least 8 characters." });
        }
        else {

            try {
                var response = await fetch("/api/user/create", {
                    method: "POST",
                    credentials: 'include',
                    body:
                        JSON.stringify({
                            name: document.getElementById("name").value,
                            password: password
                        }),
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"
                    }
                })

                if (response.status !== 200) {
                    document.getElementById("createR").style.display = "block";
                    document.getElementById("create").style.display = "none";
                    this.setState({ "error": "Problem to create user." });
                }
                
                var res = await response.json();
                if (res.error) {
                    this.setState({ "error": res.error });
                }
                else {
                    var thiss = this;
                    setTimeout(function () {
                        thiss.props.setFirstTimeLogin(false);
                    }, 5000);
                }
            }
            catch (error) {
                this.setState({ "error": error });
                document.getElementById("createR").style.display = "block";
                document.getElementById("create").style.display = "none";
            }
        }
    }


    render() {
        return (
            <div className="popupOverlay" style={{ "visibility": "visible" }}>
                <div id="popupsmall" style={{ "maxWidth": "550px" }}>
                    <h3 style={{ "marginBottom": "15px" }}>It seems to be your first time to log in. Please create a new user:</h3>
                    <div className="form-group row">
                        <label className="col-sm-3 col-form-label" style={{ "color": "grey" }}>Name </label>
                        <input type="text" id="name" required className="form-control" placeholder="username"></input>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-3 col-form-label" style={{ "color": "grey" }}>Password </label>
                        <input type="password" id="password" required className="form-control" placeholder="password"></input>
                    </div>
                    {this.state.error ? <p className="error">{this.state.error}</p> : ""}
                    <div style={{ "textAlign": "end" }}>
                        <button onClick={this.createUser} style={{ "marginRight": "5px" }} className="btn btn-primary"><i className="fa fa-circle-o-notch fa-spin" id="create" style={{ "display": "none" }}></i> <span id="createR">Create</span> </button>
                    </div>
                </div>
            </div>
        )
    }
}


