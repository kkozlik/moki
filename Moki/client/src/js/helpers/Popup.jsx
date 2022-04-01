import React, {Component} from 'react';

class Popup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: "hidden",
            text: "",
            error: ""
        };
        window.mainPopup = this;
        this.setPopup = this.setPopup.bind(this);
        this.storno = this.storno.bind(this);
        this.error = this.error.bind(this);
    }
    

    setPopup(visibility, text) {
        this.setState({
            visible: visibility,
            text, text
        })
    }

    storno() {
        this.setState({
            visible: "hidden",
            text: ""
        })
    }

    error(error) {
        this.setState({
            error: error
        })
    }


    render() {
        return (
            <div style={{ "visibility": this.state.visible, "left": 0 }} className="row align-items-center justify-content-center overlay">
                <div id="popupsmall" style={{ "maxWidth": "550px" }}>
                    {this.state.text}
                    {this.state.error ? <h3 className="error" style={{"marginTop": "10px", "color": "red"}}>{this.state.error}</h3> : ""}
                </div>
            </div>
        )
    }
}

export default Popup;