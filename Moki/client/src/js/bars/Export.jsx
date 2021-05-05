import React, { Component } from 'react';
import { getSearchableFields } from "../helpers/SearchableFields.js";
import { elasticsearchConnection } from '@moki-client/gui';
import { parseTableHits } from '@moki-client/es-response-parser';
import storePersistent from "../store/indexPersistent";

//Export to csv, json... all or just selected attributes
class Export extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: "",
            //attributes attrs+, @timestamp   
            attributes: [],
            exportOpen: false
        }
        this.loadData = this.loadData.bind(this);
        this.export = this.export.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.exportOpen !== prevState.exportOpen) {
            return { exportOpen: nextProps.exportOpen };
        }
        else return null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.exportOpen !== this.props.exportOpen) {
            this.setState({ exportOpen: this.props.exportOpen });
            if (this.props.exportOpen === true) {
                this.loadData();
            }
        }
    }

    /**
* Get data to export. If dashboard has table, use this query if doesn't user general overview query
* @return {} set data to state
* */
    async loadData() {
        try {
            //get data based on dashboard types. If there is no table, use overview call table
            var name = window.location.pathname.substr(1);
            if (name === "connectivityCA" || name === "connectivity" || name === "home" || name === "microanalysis") {
                name = "overview";
            }

            var calls = await elasticsearchConnection(name + "/table");
            var data = parseTableHits(calls.hits.hits);

            this.setState({
                data: data
            });

            //get list of all attributes attrs+, @timestamp   
            if (data[0]) {
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
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
* convert array to CSV format
* @param {array}  objArray array of object to export
* @return {string} string in CSV format
* */
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

    /**
* Export selected attributes by user, create fake element and insert there file to download
* @return {file} export file in browser
* */
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
            //export file (fake element help)
            const element = document.createElement("a");
            var file = "";
            //CSV format
            if (this.props.type === "CSV") {
                var jsonObject = JSON.stringify(result);
                result = this.convertToCSV(jsonObject);
                element.download = "data.csv";
                if (storePersistent.getState().profile[0].userprefs.mode === "encrypt") {
                    element.download = "data_decrypted.csv"
                }
                file = new Blob([result], { type: 'text/plain' });
            }
            else {
                //JSON format
                element.download = "data.json";
                if (storePersistent.getState().profile[0].userprefs.mode === "encrypt") {
                    element.download = "data_decrypted.json"
                }
                file = new Blob([JSON.stringify(result)], { type: 'text/plain' });
            }
            element.href = URL.createObjectURL(file);
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
            //close export window
            this.props.close();
        }

    }

    render() {

        /**
* return true if attribute is searchable to be checked by default
* @param {string}  filed attribute name
* @return {boolean} if searchable
* */
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
                    {this.state.attributes.length === 0 && <span className="tab">Getting list of attributes...</span>}
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