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

        var password = document.getElementById("password").value;
        //password length > 3
        if (password.length < 3) {
            this.setState({ "error": "Password must at least 3 characters." });
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
                    return response.status
                }
                var res = await response.json();
                if (res.error) {
                    this.setState({ "error": res.error });
                }
                else {
                    this.props.setFirstTimeLogin(false);
                }
            }
            catch (error) {
                this.setState({ "error": error });
            }
        }
    }


    render() {
        return (
            <div className="popupOverlay" style={{ "visibility": "visible" }}>
                <div id="popupsmall" style={{ "maxWidth": "550px" }}>
                    <h3 style={{ "marginBottom": "15px" }}>It seems to be your first time to log in. Please create a new user:</h3>
                    <div className="form-group row">
                        <label class="col-sm-3 col-form-label" style={{ "color": "grey" }}>Name </label>
                        <input type="text" id="name" required class="form-control" placeholder="username"></input>
                    </div>
                    <div className="form-group row">
                        <label class="col-sm-3 col-form-label" style={{ "color": "grey" }}>Password </label>
                        <input type="password" id="password" class="form-control" placeholder="password"></input>
                    </div>
                    {this.state.error ? <p className="error">{this.state.error}</p> : ""}
                    <div style={{ "textAlign": "end" }}>
                        <button onClick={this.createUser} className="btn btn-primary">Create</button>
                    </div>
                </div>
            </div>
        )
    }
}


