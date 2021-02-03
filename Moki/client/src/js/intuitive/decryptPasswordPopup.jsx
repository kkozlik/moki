import React, {
    Component
} from 'react';
import collapseIcon from "../../styles/icons/collapse.png";
import { storeKey } from "./decrypt";

export default class DecryptPasswordPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowPopup: "hidden",
            error: ""
        };
        this.togglePopUp = this.togglePopUp.bind(this);
        this.decrypt = this.decrypt.bind(this);
    }

    togglePopUp() {
        if (this.state.isShowPopup === "visible") {
            this.setState({ isShowPopup: "hidden" })
        }
        else {
            this.setState({ isShowPopup: "visible" })
        }
    }

    decrypt() {
        const password = document.getElementById("password").value;
        if (password.length === 0) {
            this.setState({ error: "Password can't be empty." })
        }
        else {
            storeKey(password);
            this.setState({ isShowPopup: "hidden" });
        }
    }

    render() {
        return (
            <span>
                <button className="noFormatButton bg-dark list-group-collaps list-group-item-action d-flex align-items-center" key={"decrypt"}>
                    <div className="d-flex w-100 justify-content-start align-items-center" onClick={this.togglePopUp}>
                        <img className="marginRight" src={collapseIcon} alt="collapse" />
                        <span id="collapse-text" className="menu-collapsed">Decrypt</span>
                    </div>
                </button>
                <span id="decryptPopup" style={{ visibility: this.state.isShowPopup }}>
                <button className="close" onClick={this.togglePopUp}>
                        &times;
                        </button>
                    <h3>Enter the passsword to decrypt data</h3>
                    <input type="password" id="password"></input>
                    <div className="error">{this.state.error}</div>
                    <button onClick={this.decrypt} class="btn btn-primary" id="decryptButton">Decrypt</button>
                </span>
            </span>
        )
    }
}

/*
inset into array of dashboards new div with link to popup
*/


