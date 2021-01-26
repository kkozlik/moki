import React, {
    Component
} from 'react';

import store from "../store/index";
import { getTypes } from "../helpers/getTypes.js";
import { getSearchableFields } from "../helpers/SearchableFields.js";


class Export extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: "",
            //attributes attrs+, @timestamp   
            attributes: []
        }
        this.loadData = this.loadData.bind(this);
        this.export = this.export.bind(this);
    }

    componentWillMount() {
        this.loadData();
    }

    async loadData() {
        try {

            var name = window.location.pathname.substr(1);
            if (name === "home" || name === "connectivity" || name === "connectivityCA") {
                name = "overview";
            }
            // Retrieves the list of calls
            const response = await fetch("/api/" + name + "/table", {
                method: "POST",
                credentials: 'include',
                body: JSON.stringify({
                    filters: store.getState().filters,
                    types: getTypes(),
                    timerange_gte: store.getState().timerange[0],
                    timerange_lte: store.getState().timerange[1]
                }),
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            var calls = await response.json();
            var data = calls.hits.hits;

            this.setState({
                data: data
            });

            //attributes attrs+, @timestamp             
            var attributes = Object.keys(data[0]._source.attrs);
            attributes.push("@timestamp");
            //get list of attributes from all data (can be different attributes)
            for (var i = 1; i < data.length; i++) {
                var keys = Object.keys(data[i]._source.attrs);
                for (var j = 0; j < keys.length; j++) {
                    if (!attributes.includes(keys[j])) {
                        attributes.push(keys[j]);
                    }

                }
            }
            this.setState({ attributes: attributes });

        } catch (error) {
            console.error(error);
        }
    }

    convertToCSV(objArray) {
        var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line !== '') line += ','

                line += array[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }

    export() {
        const attributesState = this.state.attributes;
        var attributes = [];
        //get rid of uncheck columns
        for (var i = 0; i < attributesState.length; i++) {
            var el = document.getElementById(attributesState[i]);
            if (el && el.checked) {
                attributes.push(attributesState[i]);
            }
        }

        //create new data structure
        var result = [attributes];
        var event = {};
        var data = this.state.data;


        for (i = 0; i < data.length; i++) {
            for (var j = 0; j < attributes.length; j++) {
                if (attributes[j] === "@timestamp") {
                    event[attributes[j]] = data[i]._source[attributes[j]] ? data[i]._source[attributes[j]] : " ";
                }
                else {
                    event[attributes[j]] = data[i]._source.attrs[attributes[j]] ? data[i]._source.attrs[attributes[j]] : " ";
                }
            }
            result.push(event);
            event = {};
        }

        if (attributes.length === 0) {
            alert("No data selected");
        } else {
            const element = document.createElement("a");
            var file = "";
            if (this.props.type === "CSV") {
                var jsonObject = JSON.stringify(result);
                result = this.convertToCSV(jsonObject);
                element.download = "data.csv";
                file = new Blob([result], { type: 'text/plain' });
            }
            else {
                //JSON
                element.download = "data.json";
                file = new Blob([JSON.stringify(result)], { type: 'text/plain' });
            }
            element.href = URL.createObjectURL(file);
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
        }

    }

    render() {

        function isSearchable(field) {

            var searchable = getSearchableFields();
            searchable.push("@timestamp");
            for (var j = 0; j < searchable.length; j++) {
                if ("attrs." + searchable[j] === field) {
                    return true;
                }
            }
            return false;
        }

        return (
            <span className="exportBody">
                <div className="row">
                    <h3 className="tab"> Select columns</h3>
                    <hr />
                </div>
                <div className="row">
                    {this.state.attributes.length === 0 && <span className="tab">No data</span>}
                    {this.state.attributes.map((attribute, i) => {
                        return (<div className="col-3" key={i}><input type="checkbox" id={attribute} className="exportCheckbox" defaultChecked={isSearchable("attrs." + attribute) ? true : false} /><label key={i}>{attribute}</label></div>)
                    })}

                </div>
                <div className="row">
                    {this.state.attributes.length !== 0 && <button className="btn btn-default rightButton" onClick={this.export}>{"Export " + this.props.type} </button>}
                </div>
            </span>

        )
    }
}

export default Export;