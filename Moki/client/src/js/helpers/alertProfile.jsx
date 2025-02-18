import { Component } from 'react';
import { parseTimestamp } from "./parseTimestamp";
import storePersistent from "../store/indexPersistent";
import { cipherAttr } from '@moki-client/gui';
const DATEFORMATS = ["lastModified", "created", "lastLogin", "lastExceeded", "ts", "lastRaised", "lastLaunchedTimer", "lastRaisedTS", "lastExceededTS", "timestamp", "lastTimerTS", "lastExpired", "lastReceivedTimer"];

class AlertProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            result: null
        }
        this.renderAlertProfile = this.renderAlertProfile.bind(this);
        this.resetProfile = this.resetProfile.bind(this);
        this.load = this.load.bind(this);
    }

    componentDidMount() {
        this.load();
    }

    async get(url) {
        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            var jsonData = await response.json();

            if (jsonData.statusCode && jsonData.statusCode === 404) {
                alert(jsonData.statusDescription);
                return;
            }

            return jsonData;
        } catch (error) {
            console.error(error);
            alert("Problem with receiving data. " + error);
            return;
        }
    }

    async resetProfile() {
        await this.get("api/alertapi/rmprofile?keyRef=" + this.state.data.alert.key.keyRef);
        this.setState({
            data: [],
            result: []
        })
    }

    async load() {
        let result = null;
        let profile = storePersistent.getState().profile;
        if (this.state.data.alert && this.state.data.alert.key && this.state.data.alert.key.keyRef) {
            result = await this.get("api/alertapi/getprofile?keyRef=" + this.state.data.alert.key.keyRef);
        }
        //add exceeded name from settings
        if (!result || (result && result.statusCode)) {
            this.close();
        }
        else {

            if (storePersistent.getState().layout.types.exceeded) {
                for (let item of Object.keys(result.Item)) {
                    for (let template of storePersistent.getState().layout.types.exceeded) {
                        if (template.id === item) {
                            result.Item[item + " - " + template.name] = result.Item[item];
                            delete result.Item[item];
                        }
                    }
                }
            }

            //decrypt IP or URI if necessary
            if (profile[0].userprefs.mode === "encrypt") {
                if (result.Item.IP) {
                    //remove hmac
                    if (!result.Item.IP.includes("plain")) {
                        let ip = result.Item.IP.substring(result.Item.IP.indexOf("#") + 1);
                        result.Item.IP = await cipherAttr("attrs.source", ip, profile, "decrypt");

                    }
                }

                if (result.Item.URI) {
                    result.Item.URI = await cipherAttr("attrs.from", result.Item.URI, profile, "decrypt");
                }
            }


            /*
            //show only result for this alarms
            var newDataFormat = { domain: result.domain };
    
            if (result.IP) {
                newDataFormat.IP = result.IP;
            }
            else if (result.URI) {
                newDataFormat.URI = result.URI;
            }
    
            //exceded is an array
            for (let hit of this.props.data.exceeded) {
                if (result[hit]) {
                    newDataFormat.exceeded = hit;
                    newDataFormat.name = getExceededName(hit);
    
                    for (let key of Object.keys(result[hit])) {
                        if (DATEFORMATS.includes(key)) {
                            newDataFormat[key] = parseTimestamp(result[hit][key] * 1000);
                        }
                        else {
                            newDataFormat[key] = result[hit][key];
                        }
                    }
                }
    
                //get alert info from layout
                if (storePersistent.getState().layout.types.exceeded) {
                    for (let template of storePersistent.getState().layout.types.exceeded) {
                        if (template.id === hit) {
                            newDataFormat.description = template.description;
                            newDataFormat.key = template.key;
                            if (template.eventTypes.length > 0) newDataFormat.eventTypes = template.eventTypes.toString(",");
                        }
                    }
                }
            }
    
            */

            this.setState({
                result: result.Item
            })
        }
    }

    close() {
        document.getElementsByClassName("popup-overlay ")[0].click();
    }

    renderAlertProfile(data) {
        if (data === null) {
            return <div>getting data...</div>
        }
        else if (Object.keys(data).length === 0) {
            return <div>no data to display</div>
        }
        else {
            var result = [];
            var style = null;
            for (let row of Object.keys(data)) {
                if (this.state.data.exceeded.includes(row)) {
                    style = { "color": "var(--main)" };
                }
                if (typeof data[row] === 'object') {
                    result.push(<div key={row} style={style}><b style={{ "display": "inline" }}>{row}</b></div>)
                    for (let row2 of Object.keys(data[row])) {
                        if (typeof data[row][row2] === 'object') {
                            result.push(<div key={row2} ><b style={{ "display": "inline", "marginLeft": "15px" }}>{row2}</b></div>)
                            for (let row3 of Object.keys(data[row][row2])) {
                                if (DATEFORMATS.includes(row3)) {
                                    result.push(<div key={Math.random()} ><b style={{ "display": "inline", "marginLeft": "30px" }}>{row3}:</b><p style={{ "display": "inline", "marginLeft": "10px" }}>{parseTimestamp(data[row][row2][row3] * 1000)}</p></div>)
                                }
                                else {
                                    result.push(<div key={Math.random()} ><b style={{ "display": "inline", "marginLeft": "30px" }}>{row3}:</b><p style={{ "display": "inline", "marginLeft": "10px" }}>{data[row][row2][row3]}</p></div>)

                                }
                            }
                        }
                        else {
                            if (DATEFORMATS.includes(row2)) {
                                result.push(<div key={Math.random()} ><b style={{ "display": "inline", "marginLeft": "15px" }}>{row2}:</b><p style={{ "display": "inline", "marginLeft": "10px" }}>{parseTimestamp(data[row][row2] * 1000)}</p></div>)
                            }
                            else {
                                result.push(<div key={Math.random()} ><b style={{ "display": "inline", "marginLeft": "15px" }}>{row2}:</b><p style={{ "display": "inline", "marginLeft": "10px" }}>{data[row][row2]}</p></div>)

                            }
                        }
                    }
                } else {
                    if (DATEFORMATS.includes(row)) {
                        result.push(<div key={Math.random()} ><b style={{ "display": "inline" }}>{row}:</b><p style={{ "display": "inline", "marginLeft": "10px" }}>{parseTimestamp(data[row] * 1000)}</p></div>);
                    }
                    else {
                        result.push(<div key={Math.random()} ><b style={{ "display": "inline" }}>{row}:</b><p style={{ "display": "inline", "marginLeft": "10px" }}>{data[row]}</p></div>);

                    }
                }
                style = null;
            }
            return result;
        }
    }


    render() {
        return (
            <div className="row no-gutters" >
                <div onClick={() => this.close()} style={{ "cursor": "pointer", "marginLeft": "97%" }}>X</div>
                <div style={{ "marginRight": "5px", "marginTop": "20px" }} className="preStyle">
                    {this.renderAlertProfile(this.state.result)}
                    {(this.state.result !== null && Object.keys(this.state.result).length !== 0) && <button className="btn btn-secondary" style={{ "float": "right" }} onClick={() => this.resetProfile()}>Reset</button>}
                </div>
            </div>
        )
    }
}

//check if IP is blacklisted
export async function checkBLip(ob) {
    try {
        let hmac = ob.encrypt;
        if (hmac && hmac !== "plain") hmac = hmac.substring(0, hmac.indexOf(":"));
        let profile = storePersistent.getState().profile;
        let key = await cipherAttr("attrs.source", ob.attrs.source, profile, "encrypt");

        let url = "api/bw/getip?key=" + key + "&list=ipblack&hmac=" + hmac + "&pretty=true"
        const response = await fetch(url, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "include"
            }
        });
        var jsonData = await response.json();

        if (jsonData.statusCode && jsonData.statusCode === 404) {
            console.error(jsonData.statusDescription);
        }
        else {
            //no result
            if (Object.keys(jsonData.Item).length === 0) {
                return false;
            }
            else {
                return true;
            }
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}

export default AlertProfile;


