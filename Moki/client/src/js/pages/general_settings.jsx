import React, {
    Component
} from 'react';
import SavingScreen from '../helpers/SavingScreen';
import isNumber from '../helpers/isNumber';
import isIP from '../helpers/isIP';
import isEmail from '../helpers/isEmail';
import deleteIcon from "../../styles/icons/delete_grey.png";
import {
    elasticsearchConnection
} from '../helpers/elasticsearchConnection';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.save = this.save.bind(this);
        this.state = {
            data: [],
            wait: false,
            tags: this.props.tags
        }
    }

    componentWillMount() {
        this.load("/api/setting");
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.tags !== this.props.tags) {
            this.setState({
                tags: nextProps.tags
            });
        }

    }

    /*
       Load data 
       */
    async load(url) {
        var jsonData;
        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            jsonData = await response.json();
            var result = [];
            jsonData.forEach(data => {
                if (data.app === "m_config")
                    result = data.attrs
            });
            this.setState({
                data: result
            });
            console.info("Got general settings data " + JSON.stringify(result));

        } catch (error) {
            console.error(error);
            alert("Problem with receiving settings data. " + error);
        }

    }

    validate(attribute, value) {
        if (attribute === "tlc_cert_verify_level") {
            if (value === "0" || value === "1" || value === "2" || value === "3" || value === "4") {
                return true;
            }
            return "Error: Peer certificate verification level must be 0-4";
        }

        if (attribute === "gui_port" || attribute === "events_cleanup_days" || attribute === "events_cleanup_percentage" || attribute === "pcap_cleanup_minutes" || attribute === "recordings_cleanup_minutes") {
            if (isNumber(value)) {
                return true;
            }
            return "Error: " + attribute + " must be integer.";
        }

        if (attribute === "logstash_heap_mem" || attribute === "elasticsearch_heap_mem" || attribute === "logstash_queue_size") {
            if ((value.slice(-1) === "g" || value.slice(-1) === "m") && isNumber(value.slice(0, value.length - 1)) && value.slice(0, value.length - 1) % 1 === 0) {
                return true;
            }
            return "Error: " + attribute + " must have format integer and m or g suffix.";
        }


        if (attribute === "slowlog_query_warn" || attribute === "slowlog_query_info" || attribute === "slowlog_fetch_warn" || attribute === "slowlog_fetch_info" || attribute === "slowlog_indexing_info" || attribute === "slowlog_indexing_warn" || attribute === "refresh_interval_logstash" || attribute === "refresh_interval_collectd" || attribute === "refresh_interval_exceeded") {
            if (value.slice(-1) === "s" && isNumber(value.slice(0, value.length - 1)) && value.slice(0, value.length - 1) % 1 === 0) {
                return true;
            }
            return "Error: " + attribute + " must have format integer and s suffix.";
        }

        if (attribute === "slowlog_search_level" || attribute === "slowlog_indexing_level") {
            if (value === "warn" || value === "info") {
                return true;
            }
            return "Error: " + attribute + " must have format info or warn.";
        }

        if (attribute === "fw_src_gui" || attribute === "fw_src_ssh" || attribute === "fw_src_events") {


            if (value.length === 0) {
                return true;
            }
            var checkValue = value.split(' ');
            var i = checkValue.map(x => isIP(x));
            if (i.includes(false)) {
                return "Error: " + attribute + " must have format IP or subnet format.";
            }
        }

        if (attribute === "bl_email_to" || attribute === "bl_email_from" || attribute === "email_reports") {
            if (value.length === 0) {
                return true;
            }

            if (isEmail(value)) {
                return true;
            }
            return "Error: " + attribute + " must have email format.";
        }

        return true;

    }


    //save data   
    async save() {
        if (this.state.wait !== true) {
            var jsonData = this.state.data;
            var result = [];
            for (var i = 0; i < jsonData.length; i++) {
                var data = document.getElementById(jsonData[i].attribute);
                if (data.type === "checkbox") {
                    jsonData[i].value = data.checked;

                }
                else if (jsonData[i].attribute === "jwtAdmins" && !Array.isArray(jsonData[i].value)) {
                    jsonData[i].value = jsonData[i].value.split(",");

                } else {
                    jsonData[i].value = data.value;
                }

                var validateResult = this.validate(jsonData[i].attribute, jsonData[i].value)
                if (validateResult !== true) {
                    alert(validateResult);
                    return;
                }
                result.push({
                    attribute: jsonData[i].attribute,
                    value: jsonData[i].value
                });

            };
            this.setState({
                wait: true
            });
            var thiss = this;
            await fetch("api/save", {
                method: "POST",
                body: JSON.stringify({
                    "app": "m_config",
                    "attrs": result

                }),
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            }).then(function (response) {
                thiss.setState({
                    wait: false
                });
                if (!response.ok) {
                    console.error(response.statusText);
                }
                return response.json();
            }).then(function (responseData) {
                if(responseData.msg){
                    alert(responseData.msg);
                }

            }).catch(function (error) {
                console.error(error);
                alert("Problem with saving data. " + error);
            });
        }
    }



    generate(dataAlarm) {
        var data = dataAlarm;
        var alarms = [];
        if (data.length !== 0) {
            // Outer loop to create parent
            for (var i = 0; i < data.length; i++) {
                alarms.push(<div key={
                    data[i].attribute + "key"
                }
                    className="tab "> <span className="form-inline row justify-content-start paddingBottom"> <label className="col-7" > {
                        data[i].label
                    } </label>
                        {data[i].type === "boolean" ?
                            data[i].value ? <input className="text-left form-check-input" type="checkbox" defaultChecked="true" id={data[i].attribute} /> :
                                <input className="text-left form-check-input" type="checkbox" id={data[i].attribute} />
                            : <input className="text-left form-control form-check-input" type={data[i].type} defaultValue={data[i].value} id={data[i].attribute} />
                        }
                    </span></div>);
            }
        }
        return alarms
    }

    generateTags() {
        var data = this.state.tags;

        var tags = [];
        if (data.length !== 0) {
            for (var i = 0; i < data.length; i++) {
                tags.push(<div key={
                    data[i].key
                }
                    className="tab" > <span className="form-inline row justify-content-start paddingBottom" >
                        <img className="icon"
                            alt="deleteIcon"
                            src={
                                deleteIcon
                            }
                            title="delete tag"
                            onClick={
                                this.deleteTag.bind(this)
                            }
                            id={
                                data[i].key
                            }
                        /> <label className="col-4" > {
                            data[i].key + " (" + data[i].doc_count + ")"
                        } </label> </span> </div>);
            }
        } else {
            tags.push(< div className="tab" key="notags"> No tags. Create them directly in event's table.</div>);

        }
        return tags
    }

    async deleteTag(e) {
        var tag = e.currentTarget.id;
        var data = await elasticsearchConnection("/api/tag/delete", { id: "", index: "", tags: tag });
        if (data.deleted >= 0) {
            var tags = this.state.tags;
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].key === tag) {
                    tags.splice(i, 1);
                }
            }
            //this.props.getTags();
            this.setState({
                tags: tags
            });
        } else {
            alert(JSON.stringify(data));
        }

    }


    render() {

        var data = this.state.data;
        var General = [];
        var Slowlog = [];
        var LE = [];
        var Firewall = [];
        var Events = [];
        var Auth = [];

        //separate type
        for (var i = 0; i < data.length; i++) {
            if (data[i].category === "General") {
                General.push(data[i]);
            } else if (data[i].category === "Slowlog") {
                Slowlog.push(data[i]);
            } else if (data[i].category === "Logstash and elasticsearch") {
                LE.push(data[i]);
            } else if (data[i].category === "Firewall") {
                Firewall.push(data[i]);
            } else if (data[i].category === "Events") {
                Events.push(data[i]);
            }
            else if (data[i].category === "Authentication") {
                Auth.push(data[i]);
            }
        }

        var Generaldata = this.generate(General);
        var Slowlogdata = this.generate(Slowlog);
        var LEdata = this.generate(LE);
        var Firewalldata = this.generate(Firewall);
        var Eventsdata = this.generate(Events);
        var Authdata = this.generate(Auth);
        var Tagdata = this.generateTags();


        return (<div className="container-fluid" > {
            this.state.wait && < SavingScreen />
        } <p className="settingsH" > General </p> {
                Generaldata
            }

            <p className="settingsH" > Firewall </p> {
                Firewalldata
            }
            <p className="settingsH" > Authentication </p> {
                Authdata
            }
            <p className="settingsH" > Events </p> {
                Eventsdata
            } <p className="settingsH" > Elasticsearch and logstash </p> {
                LEdata
            } <p className="settingsH" > Slowlog </p> {
                Slowlogdata
            } <p className="settingsH" > Tags </p> {
                Tagdata
            }


            <div className="btn-group rightButton" >
                <button type="button"
                    className="btn btn-primary "
                    onClick={
                        this.save
                    }
                    style={
                        {
                            "marginRight": "5px"
                        }
                    } > Save </button> <button type="button"
                        className="btn btn-secondary"
                        onClick={
                            () => this.load("api/defaults")
                        } > Reset </button> </div >

        </div>
        )
    }

}

export default Settings;
