import { Component } from 'react';
import { getExceededName } from '@moki-client/gui';
import { parseTimestamp } from "./parseTimestamp";
import storePersistent from "../store/indexPersistent";
const DATEFORMATS = ["lastModified", "created", "lastLogin", "lastExceeded", "ts", "lastRaised"];

class AlertProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            result: {}
        }

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

    async load() {
        let result = [];
        let hmac = window.localStorage.HMAC_SHA_256_KEY ? window.localStorage.HMAC_SHA_256_KEY : "plain";
        if (hmac !== "plain") hmac = hmac.substring(0, hmac.indexOf(":"));

        if (this.state.data["exceeded-by"] === "ip") {
            result = await this.get("api/bw/getip?key=" + this.state.data.attrs.source + "&list=ipprofile&hmac=" + hmac + "&pretty=true");
        }
        else {
            result = await this.get("api/bw/geturi?key=" + this.state.data.attrs.from + "&list=uriprofile&hmac=" + hmac + "&pretty=true");
        }

        result = result.Item;

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
                        newDataFormat[key] = parseTimestamp(result[hit][key]*1000);
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
                        if(template.eventTypes.length > 0)  newDataFormat.eventTypes = template.eventTypes.toString(",");
                    }
                }
            }
        }

        this.setState({
            result: newDataFormat
        })
    }


    render() {
        var data = this.state.result;
        return (
            <div className="row no-gutters" >
                <div  style={{ "marginRight": "5px", "marginTop": "20px" }} className="preStyle">
                    {Object.keys(data).length > 0 && Object.keys(data).map((row, i) => {
                        return (<div key={row} ><b style={{ "display": "inline" }}>{row}:</b><p style={{ "display": "inline", "marginLeft": "10px" }}>{data[row]}</p></div>)
                    })}

                    {Object.keys(data).length === 0 && <span>loading data...</span>}
                </div>
            </div>
        )
    }
}

export default AlertProfile;