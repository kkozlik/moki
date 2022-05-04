import React, { Component } from 'react';

class Popup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: "hidden",
            text: "",
            error: "",
            timeout: null,
            showOKAnnoying: false
        };
        window.mainPopup = this;
        this.setPopup = this.setPopup.bind(this);
        this.storno = this.storno.bind(this);
        this.error = this.error.bind(this);
        this.showAnnoying = this.showAnnoying.bind(this);
        this.stornoAnnoying = this.stornoAnnoying.bind(this);
        this.stopStornoAnnoying = this.stopStornoAnnoying.bind(this);
    }


    setPopup(visibility, text, showOKAnnoying = false) {
        this.setState({
            visible: visibility,
            text, text,
            showOKAnnoying: showOKAnnoying
        })
    }

    storno() {
        this.setState({
            visible: "hidden",
            text: ""
        })
    }

    //special annoying popup (for subscription purpose)
    stornoAnnoying() {
        this.setState({
            visible: "hidden"
        })

        if (this.state.timeout) {
            clearTimeout(this.state.timeout);
        }
        this.showAnnoying();

    }

    showAnnoying() {
        let timeout = setTimeout(() => {
            this.setState({
                visible: "visible"
            })
        }, 45000)

        this.setState({ timeout: timeout })
    }

    stopStornoAnnoying() {
        this.storno();
        if(this.state.timeout) clearTimeout(this.state.timeout);

        this.setState({
            timeout: null
        })

    }

    error(error) {
        this.setState({
            error: error
        })
    }

    //showOKAnnoying  special annonying ok button that shows all the time
    render() {
        return (
            <div style={{ "visibility": this.state.visible, "left": 0 }} className="row align-items-center justify-content-center overlay">
                <div id="popupsmall" style={{ "maxWidth": "550px" }}>
                    {this.state.text}
                    {this.state.error ? <h3 className="error" style={{ "marginTop": "10px", "color": "red" }}>{this.state.error}</h3> : ""}
                    {this.state.showOKAnnoying ? <div><button className="btn btn-secondary" onClick={() => this.stornoAnnoying()} style={{ "marginTop": "15px", "marginLeft": "28%" }}>OK</button></div> : ""}
                </div>
            </div>
        )
    }
}

export default Popup;