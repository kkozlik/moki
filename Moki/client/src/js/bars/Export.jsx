import React, { Component } from 'react';
import { getSearchableFields } from "../helpers/SearchableFields.js";
import { elasticsearchConnection } from '@moki-client/gui';
import { parseTableHits } from '@moki-client/es-response-parser';
import storePersistent from "../store/indexPersistent";

class Export extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: "",
            //attributes attrs+, @timestamp   
            attributes: [],
            exportOpen: false,
            error: ""
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

    async loadData() {
        document.getElementById("loadingExport").innerHTML = "Getting all data, it can take a while!";
        try {

            var name = window.location.pathname.substr(1);
            if (name === "connectivityCA" || name === "connectivity" || name === "home" || name === "microanalysis") {
                name = "overview";
            }

            // Retrieves the list of calls
            var calls = await elasticsearchConnection(name + "/table", { "size": "10000", "type": "export" });
            //parse data
            if (calls && calls.hits && calls.hits.hits && calls.hits.hits.length > 0) {
                var data = await parseTableHits(calls.hits.hits, storePersistent.getState().profile, "export");

                this.setState({
                    data: data
                });


                const visitNodes = (obj, visitor, stack = []) => {
                    if (typeof obj === 'object') {
                        for (let key in obj) {
                            visitNodes(obj[key], visitor, [...stack, key]);
                        }
                    } else {
                        visitor(stack.join('.'), obj);
                    }
                }

                //list of all attrs  
                if (data[0]) {
                    var attributes = [];
                    for (let hit of data) {
                        visitNodes(hit._source, (path, value) => {
                            if (!attributes.includes(path)) {
                                attributes.push(path)
                            }
                        });
                    }
                    console.log(attributes);
                    attributes.sort();
                    this.setState({ attributes: attributes });
                }
            }
            else {
                this.setState({
                    error: "No column list from elasticsearch"
                })
                document.getElementById("loadingExport").innerHTML = "No data in elasticsearch";

            }

        } catch (error) {
            this.setState({
                error: error
            })
            document.getElementById("loadingExport").innerHTML = "Problem to get data from elasticsearch";
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
        this.setState({ attributes: [] });
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
                if (storePersistent.getState().profile && storePersistent.getState().profile[0] && storePersistent.getState().profile[0].userprefs.mode === "encrypt") {
                    element.download = "data_decrypted.csv"
                }
                file = new Blob([result], { type: 'text/plain' });
            }
            else {
                //JSON
                element.download = "data.json";
                if (storePersistent.getState().profile && storePersistent.getState().profile[0] && storePersistent.getState().profile[0].userprefs.mode === "encrypt") {
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

    checkAll() {
        let checkboxes = document.getElementsByClassName("exportCheckbox");
        let isChecked = document.getElementById("allCheckExport").checked;
        for (let hit of checkboxes) {
            hit.checked = isChecked;
        }
    }

    render() {

        function isSearchable(field) {

            var searchable = getSearchableFields();
            searchable.push("@timestamp");
            for (var j = 0; j < searchable.length; j++) {
                if (searchable[j] === field) {
                    return true;
                }
            }
            return false;
        }

        return (
            <span className="exportBody">
                <div className="row">
                    {this.state.attributes.length !== 0 && <h3 className="tab"> Select columns</h3>}
                    {this.state.attributes.length !== 0 && <span> <input type="checkbox" id="allCheckExport" className="exportCheckbox" onClick={this.checkAll} /><span>all</span></span>}
                    <hr />
                </div>
                <div className="row">
                    {this.state.attributes.length === 0 &&  <span style={{ "color": "grey", "fontSize": "large", "marginLeft": "40%" }} id="loadingExport">Getting all data, it can take a while!</span>}
                    {this.state.attributes.map((attribute, i) => {
                        return (<div className="col-3" key={i}><input type="checkbox" id={attribute} className="exportCheckbox" defaultChecked={isSearchable(attribute) ? true : false} /><label key={i}>{attribute}</label></div>)
                    })}

                </div>
                <div className="row">
                {this.state.attributes.length !== 0 &&  storePersistent.getState().profile && storePersistent.getState().profile[0] && storePersistent.getState().profile[0].userprefs.mode === "encrypt" && <span><input type="checkbox" id="decryptCheckbox" className="decryptCheckbox" defaultChecked={false} /><label style={{"paddingBottom": "11px"}}>Decrypt data. Warning, it can take a few minutes.</label></span>  }
                    {this.state.attributes.length !== 0 && <button className="btn btn-default rightButton" onClick={this.export}>{"Export " + this.props.type} </button>}
                </div>
            </span>

        )
    }
}

export default Export;