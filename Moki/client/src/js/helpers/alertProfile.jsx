import React, { Component } from 'react';

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
        console.log(this.state.data);
        let result = [];
        let hmac = window.localStorage.HMAC_SHA_256_KEY ? window.localStorage.HMAC_SHA_256_KEY : "plain";
        if (hmac !== "plain") hmac = hmac.substring(0, hmac.indexOf(":"));

        if (this.state.data["exceeded-by"] === "ip") {
            result = await this.get("api/bw/getip?key=" + this.state.data.attrs.source + "&list=ipprofile&hmac=" + hmac);
        }
        else {
            result = await this.get("api/bw/geturi?key=" + this.state.data.attrs.from + "&list=uriprofile&hmac=" + hmac);
        }

        if (result.Item) {
            this.setState({
                result: result.Item
            })
        }
    }

    render() {
        var data = this.state.result;
        /*   if (Object.keys(this.state.data).length > 0 && Object.keys(this.state.result).length > 0) {
               //check exceeded
               for (let key of Object.keys(this.state.result)) {
                   if (key === "domain") {
   
                       data.push({"domain": this.state.result[key] })
                   }
   
                   if (key === "IP") {
                       data.push({ "IP": this.state.result[key] })
                   }
   
                   if (key === "URI") {
                       data.push({ "URI": this.state.result[key] })
                   }
   
                   if (key.includes(this.state.data.exceeded)) {
                       data.push({ [key]: this.state.result[key] })
                   }
               }
           }
           */

        return (
            <div className="row no-gutters" >
                <div className="col-auto" style={{ "marginRight": "5px" }}>
                    {Object.keys(data).length > 0 && Object.keys(data).map((row, i) => {
                        return (<div key={row}><p style={{ "display": "inline" }}>{row}</p><p style={{ "display": "inline", "marginLeft": "10px" }}>{data[row]}</p></div>)
                    })}

                    {Object.keys(data).length === 0 &&  <span>loading data...</span>}
                </div>
            </div>
        )
    }
}

export default AlertProfile;