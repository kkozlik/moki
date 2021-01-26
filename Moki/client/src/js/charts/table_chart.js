
/*
Get call table

it is seperate request from call charts
*/
import React, {
    Component
} from 'react';
import Popup from "reactjs-popup";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { getSearchableFields } from "../helpers/SearchableFields.js";
import { getDisplayFields } from "../helpers/DisplayFields.js";
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import filter from "../../styles/icons/filter.png";
import unfilter from "../../styles/icons/unfilter.png";
import { createFilter } from "../helpers/createFilter";
import emptyIcon from "../../styles/icons/empty.png";
import tagIcon from "../../styles/icons/tag.png";
import downloadIcon from "../../styles/icons/download.png";
import downloadPcapIcon from "../../styles/icons/downloadPcap.png";
import viewIcon from "../../styles/icons/view.png";
import excludeIcon from "../../styles/icons/exclude.png";
import detailsIcon from "../../styles/icons/details.png";
import store from "../store/index";
import { elasticsearchConnectionTag } from '../helpers/elasticsearchConnectionTag';
import { downloadPcap } from '../helpers/downloadPcap';
import { downloadSD } from '../helpers/downloadSD';
import { downloadPcapMerged } from '../helpers/downloadPcapMerged';
import TagRanger from "../bars/TagRanger";
var FileSaver = require('file-saver');
var JSZip = require("jszip");

export default class listChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }
            }],
            data: [],
            excludeList: [],
            selectedRowsList: [],
            tags: this.props.tags,
            checkall: false,
            selected: []
        }

        this.filter = this.filter.bind(this);
        this.downloadAll = this.downloadAll.bind(this);
        this.export = this.export.bind(this);
        this.unfilter = this.unfilter.bind(this);
        this.tags = this.tags.bind(this);
        this.movetooltip = this.movetooltip.bind(this);
        this.onEnterKey = this.onEnterKey.bind(this);
        this.onEnterKeyExclude = this.onEnterKeyExclude.bind(this);
        this.tableColumns = this.tableColumns.bind(this);
        this.handleOnSelect = this.handleOnSelect.bind(this);
        this.handleOnSelectAll = this.handleOnSelectAll.bind(this);
        this.getRecord = this.getRecord.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({ data: nextProps.data });
        }
        if (nextProps.tags !== this.props.tags) {
            this.setState({ tags: nextProps.tags });
        }

    }

    componentDidUpdate(prevProps) {
        var table = document.getElementsByClassName('table table-hover')[0];
        if (table) {
            resizableGrid(table);
        }
        //add resizable grid to table, function from https://www.brainbell.com/javascript/making-resizable-table-js.html
        function resizableGrid(table) {
            var row = table.getElementsByTagName('tr')[0],
                cols = row ? row.children : undefined;
            if (!cols) return;

            table.style.overflow = 'hidden';

            var tableHeight = table.offsetHeight;
            for (var i = 0; i < cols.length; i++) {
                var div = createDiv(tableHeight);
                cols[i].appendChild(div);
                cols[i].style.position = 'relative';
                setListeners(div);
            }
            function setListeners(div) {
                var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

                div.addEventListener('mousedown', function (e) {
                    e.stopPropagation();
                    curCol = e.target.parentElement;
                    nxtCol = curCol.nextElementSibling;
                    pageX = e.pageX;

                    var padding = paddingDiff(curCol);

                    curColWidth = curCol.offsetWidth - padding;
                    if (nxtCol)
                        nxtColWidth = nxtCol.offsetWidth - padding;
                });

                div.addEventListener('mouseover', function (e) {
                    e.target.style.borderRight = '2px solid #30427f';
                })

                div.addEventListener('mouseout', function (e) {
                    e.target.style.borderRight = '';
                })
                document.addEventListener('mousemove', function (e) {
                    if (curCol) {
                        var diffX = e.pageX - pageX;

                        if (nxtCol && (nxtColWidth - (diffX)) > 50)
                            nxtCol.style.width = (nxtColWidth - (diffX)) + 'px';

                        if ((curColWidth + diffX) > 50)
                            curCol.style.width = (curColWidth + diffX) + 'px';
                    }
                });

                document.addEventListener('mouseup', function (e) {
                    curCol = undefined;
                    nxtCol = undefined;
                    pageX = undefined;
                    nxtColWidth = undefined;
                    curColWidth = undefined
                });
            } function createDiv(height) {
                var div = document.createElement('div');
                div.className = "resize";
                div.style.top = 0;
                div.style.right = 0;
                div.style.width = '30px';
                div.style.position = 'absolute';
                div.style.cursor = 'col-resize';
                div.style.userSelect = 'none';
                div.style.height = height + 'px';
                return div;
            }

            function paddingDiff(col) {

                if (getStyleVal(col, 'box-sizing') === 'border-box') {
                    return 0;
                }
                var padLeft = getStyleVal(col, 'padding-left');
                var padRight = getStyleVal(col, 'padding-right');
                return (parseInt(padLeft) + parseInt(padRight));

            }

            function getStyleVal(elm, css) {
                return (window.getComputedStyle(elm, null).getPropertyValue(css))
            }
        }

    }

    //define searchable field from SearchableFields.js
    isSearchable(field) {

        var searchable = getSearchableFields();
        for (var j = 0; j < searchable.length; j++) {
            if ("attrs." + searchable[j] === field) {
                return true;
            }
        }
        return false;
    }

    //insert columns iinto table
    async UNSAFE_componentWillMount() {
        const columns = this.tableColumns(this.props.name);
        //add other hidden columns 
        var searchable = getSearchableFields();
        //remove the same
        var removeIndices = [];
        for (var i = 0; i < searchable.length; i++) {
            for (var j = 0; j < columns.length; j++) {
                if (searchable[i] && columns[j].dataField === "_source.attrs." + searchable[i]) {
                    removeIndices.push(i);
                }
            }
        }

        //remove indices
        for (i = removeIndices.length - 1; i >= 0; i--)
            searchable.splice(removeIndices[i], 1);

        //insert filtered columns
        for (i = 0; i < searchable.length; i++) {
            var field = searchable[i];
            columns.push(
                {
                    dataField: '_source.attrs.' + field,
                    text: field.toUpperCase(),
                    hidden: true,
                    editable: false,
                    sort: true,
                    headerStyle: { width: '150px' },
                    formatExtraData: "attrs." + field,
                    formatter: (cell, obj, i, formatExtraData) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field={formatExtraData} value={cell} className="icon" alt="filterIcon" src={filter} /><img field={formatExtraData} value={cell} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >    {cell}
                        </span>
                    }
                });
        }
        this.setState({ columns: columns });

        //store already exclude alarms list
        try {
            const response = await fetch("/api/setting", {
                method: "GET",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Credentials": "include"
                }
            });
            var jsonData = await response.json();
            var thiss = this;
            jsonData.forEach(data => {
                if (data.app === "m_alarms")
                    thiss.setState({ excludeList: data.attrs });
            });
        } catch (error) {
            console.error(error);
            alert("Problem with receiving alarms data. " + error);
        }

    }

    //check if alarms is already exclude -> don't display exclude icon
    isAlreadyExclude(ob) {
        var excludeList = this.state.excludeList;
        for (var i = 0; i < excludeList.length; i++) {
            //ob.exceeded + "_exclude" === excludeList[i].attribute
            if (excludeList[i].attribute === ob.exceeded + "_exclude" || (Array.isArray(ob.exceeded) && ob.exceeded.filter(ex => ex + "_exclude" === excludeList[i].attribute).length > 0)) {
                if (excludeList[i].category === "URI") {
                    if (excludeList[i].value.includes(ob.attrs.from)) return true;
                }
            } else if (excludeList[i].category === "IP") {
                if (excludeList[i].value.includes(ob.attrs.source)) return true;
            }
        }
        return false;

    }

    //download event, pcap and sequence chart in zip file     
    async downloadAll(obj) {
        var fileName = obj.attrs.filename;
        fileName = fileName ? fileName.substring(0, fileName.length - 5) : "";
        fileName = fileName ? fileName.substring(fileName.lastIndexOf("/") + 1) : Math.random().toString(36).substring(7);

        var zip = new JSZip();

        //export json (always exists)
        var json = new Blob([JSON.stringify(obj)], { type: 'text/plain' });
        zip.file(fileName + ".json", json);

        //download sd
        var sd = await downloadSD(obj.attrs.filename);
        if (sd && !sd.includes("Error")) {
            zip.file(fileName + ".html", sd);
        }


        //download pcap
        await downloadPcap(obj.attrs.filename).then(function (data) {
            fileName = fileName ? fileName.substring(fileName.lastIndexOf("/") + 1) : Math.random().toString(36).substring(7);
            if (typeof data !== 'string' || !data.includes("ERROR")) {
                var blob = new Blob([data], { type: "pcap" });
                zip.file(fileName + ".pcap", blob);
            }
        })

        zip.generateAsync({ type: "blob" })
            .then(function (blob) {
                FileSaver.saveAs(blob, "export.zip");
            });
    }

    //download pcap           
    async getPcap(event) {
        var fileName = event.currentTarget.getAttribute('file');
        await downloadPcap(event.currentTarget.getAttribute('file')).then(function (data) {
            if (typeof data === 'string') {
                alert(data);
            }
            else {
                var blob = new Blob([data], { type: "pcap" });
                const element = document.createElement("a");
                element.download = fileName;
                element.href = URL.createObjectURL(blob);
                document.body.appendChild(element);
                element.click();
            }
        })
    }

    //display duration in HH MM SS format
    formatDuration(duration) {
        var sec_num = parseInt(duration, 10);

        var days = Math.floor(sec_num / 86400) ? Math.floor(sec_num / 86400) + "d" : "";

        var hours = Math.floor(sec_num / 3600) ? Math.floor(sec_num / 3600) + "h" : "";

        var minutes = Math.floor((sec_num % 3600) / 60) ? Math.floor((sec_num % 3600) / 60) + "m" : "";

        var seconds = sec_num % 60 ? sec_num % 60 + "s" : "";

        //don't  display seconds if value is in days
        if (days) {
            seconds = "";
        }


        return days + " " + hours + " " + minutes + " " + seconds;
    }

    //filter
    export(result) {
        const element = document.createElement("a");
        var file = "";
        element.download = "data.json";
        file = new Blob([JSON.stringify(result)], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }
    //filter
    filter(event) {
        createFilter(event.currentTarget.getAttribute('field') + ":\"" + event.currentTarget.getAttribute('value') + "\"");
    }

    //unfilter
    unfilter(event) {
        createFilter("NOT " + event.currentTarget.getAttribute('field') + ":\"" + event.currentTarget.getAttribute('value') + "\"");
    }

    //moving tooltip according cursor position
    movetooltip(e) {
        var x = e.clientX;
        var y = e.clientY;

        //Set tooltip position according to mouse position
        e.currentTarget.style.top = (y + 20) + 'px';
        e.currentTarget.style.left = (x + 20) + 'px';

    }

    onEnterKey(event) {
        if (event.keyCode === 13) {
            this.tags();
        }
    }

    onEnterKeyExclude(event, ob) {
        if (event.keyCode === 13) {
            this.exclude(ob);
        }
    }

getRecord(id){
    var data = this.state.data;
    for (var i = 0; i < data.length; i++) {
        if(data[i]._id === id) return data[i];
    }
}

    //add tags to event
    async tags() {
        var selected = this.state.selected;
        var tag = document.getElementById("tag").value;
        var result;
        if (selected.length === 0) {
            alert("You must check events to tag.");
        }
        else {
            for (var i = 0; i < selected.length; i++) {
                var record = this.getRecord(selected[i]);
                //previous tag exist
                if (record['_source']['attrs']['tags']) {
                    var tags = record['_source']['attrs']['tags'] + "," + tag.toString();
                    result = await elasticsearchConnectionTag("/api/tag", record['_id'], record['_index'], tags);
                }
                else {
                    result = await elasticsearchConnectionTag("/api/tag", record['_id'], record['_index'], tag);
                }
                console.info("Tagging event");
                console.info(result);
            }
            //get rid of race condition by waiting before getting new data again
            if (result.result && result.result === "updated") {
                setTimeout(function () {

                    //alert("Tag has been saved."); 
                    document.getElementById("popupTag").style.display = "none";
                    document.getElementById("tag").value = "";
                    document.getElementsByClassName("iconReload")[0].click();


                }, 1000);
            }
            else {
                alert(result);
            }
        }

    }
    openPopupTag() {
        document.getElementById("popupTag").style.display = "inline";
        document.getElementById("tag").focus();
    }

    openExclude(i) {
        document.getElementById("popupExclude" + i.id).style.display = "inline";
        document.getElementById("input" + i.id).focus();
    }

    closePopupTag() {
        document.getElementById("popupTag").style.display = "none";
    }

    closePopupExclude(i) {
        document.getElementById("popupExclude" + i.id).style.display = "none";
    }

    async exclude(i) {
        var comment = document.getElementById("input" + i.id).value;
        if (comment && comment !== "") {
            //fetch old exclude data
            try {
                const response = await fetch("/api/setting", {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"
                    }
                });
                var jsonData = await response.json();
                var result = [];
                jsonData.forEach(data => {
                    if (data.app === "m_alarms") {
                        result = data.attrs;
                    }
                });
                var value = "";
            } catch (error) {
                console.error(error);
                alert("Problem with receiving alarms data. " + error);
            }
            var exceeded = i.exceeded + "_exclude";
            if (i["exceeded-by"] === "URI") {
                value = i.attrs.from;
            }
            else if (i["exceeded-by"] === "IP") {
                value = i.attrs.source;
            }
            else if (i["exceeded-by"] === "CA") {
                value = i.attrs.dst_ca_id;
            }
            //if more alarms were triggered
            if (Array.isArray(i["exceeded-by"])) {
                for (var k = 0; k < i["exceeded-by"].length; k++) {
                    exceeded = i["exceeded"][k] + "_exclude";
                    if (i["exceeded-by"][k] === "source") {
                        value = i.attrs.source;
                    }
                    else {
                        value = i.attrs.from;
                    }
                    for (var j = 0; j < result.length; j++) {
                        if (result[j].attribute === exceeded) {
                            //if ip/uri not already exists
                            if (!result[j].value.includes(value)) {
                                result[j].value.push(value);
                            }
                            result[j].comments.push(comment);
                        }
                    }
                }
            }
            else {
                for (j = 0; j < result.length; j++) {
                    if (result[j].attribute === exceeded) {
                        //if ip/uri not already exists
                        if (!result[j].value.includes(value)) {
                            result[j].value.push(value);
                        }
                        if(!result[j].comments){
                            result[j].comments = [];
                        }
                        result[j].comments.push(comment);
                    }
                }
            }
            if (value !== "") {
                await fetch("api/save", {
                    method: "POST",
                    body: JSON.stringify({
                        "app": "m_alarms",
                        "attrs": result

                    }),
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Credentials": "include"
                    }
                }).then(function (response) {
                    if (!response.ok) {
                        console.error(response.statusText);
                        return false;
                    }
                    return response.json();

                }).then(function (responseData) {
                    if (responseData === false || responseData.msg.includes("error")) {
                        alert(responseData.msg);
                        return false;
                    }
                    // alert(responseData.msg);
                    return true;
                }).catch(function (error) {
                    console.error(error);
                    alert("Problem with saving data. " + error);
                    return false;
                });

                document.getElementById("input" + i.id).value = "";
                document.getElementById("popupExclude" + i.id).style.display = "none";
                document.getElementById("spanExclude" + i.id).style.display = "none";
            }
        }
        else {
            alert("Write a comment why you want to exclude this URI/IP.");
        }
    }

    isAdmin() {
        var aws = store.getState().user.aws;
        if (aws === true) {

            var user = document.getElementById("user").innerHTML;
            if (user.includes("ADMIN")) {
                return true;
            }
        }
        return false;
    }

    syntaxHighlight(json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 4);
        }

        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }


            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    handleOnSelect(row, isSelect) {
        if (isSelect) {
          this.setState(() => ({
            selected: [...this.state.selected, row._id]
          }));
        } else {
          this.setState(() => ({
            selected: this.state.selected.filter(x => x !== row._id)
          }));
        }
      }
    
      handleOnSelectAll(isSelect, rows) {
        const ids = this.state.data.map(r => r._id);
        if (isSelect) {
          this.setState(() => ({
            selected: ids
          }));
        } else {
          this.setState(() => ({
            selected: []
          }));
        }
      }

    tableColumns(dashboard) {
        switch (dashboard) {
            case 'calls': return [
                {
                    dataField: '_source._id',
                    text: 'ID',
                    hidden: true,
                    isKey: true
                }, {
                    dataField: '_source.@timestamp',
                    text: 'TIMESTAMP',
                    editable: false,
                    sort: true,
                    headerStyle: { width: '170px' },
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return new Date(ob['@timestamp']).toLocaleString();
                    }

                }, {
                    dataField: '_source.attrs.type',
                    text: 'TYPE',
                    editable: false,
                    sort: true,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.type}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.from',
                    text: 'FROM',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.from}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.to',
                    text: 'TO',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.to}
                        </span>
                    }
                },
                {
                    dataField: '_source.attrs.duration',
                    text: 'DURATION',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.duration" value={ob.attrs.duration} className="icon" alt="filterIcon" src={filter} /><img field="attrs.duration" value={ob.attrs.duration} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{this.formatDuration(ob.attrs.duration)}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.source',
                    text: 'SOURCE',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.source}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.tags',
                    text: 'TAGS',
                    sort: true,
                    headerStyle: { width: '150px !important' },
                    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                        <TagRanger tags={this.state.tags} row={row} />
                    ),

                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                        </span>
                    }
                }, {
                    dataField: '_source.filenameDownload',
                    text: 'ADVANCED',
                    editable: false,
                    headerStyle: { width: '150px' },
                    formatter: (cell, obj) => {

                        var ob = obj._source;
                        return <span>
                            {ob.attrs.filenameDownload &&
                                <a onClick={this.getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                            }

                            <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                            {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                            }

                            {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                                {close => (
                                    <div className="Advanced">
                                        <button className="link close export" onClick={() => this.export(ob)}>
                                            Export json
                            </button>
                                        <button className="close" onClick={close}>
                                            &times;
                            </button>
                                        <div className="contentAdvanced">
                                            <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                        </div>
                                    </div>
                                )}
                            </Popup>
                            }
                        </span>
                    }
                }];
            case 'logins': return [{
                dataField: '_source.timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            },
            {
                dataField: '_source.user',
                text: 'USER',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="user" value={ob.user} className="icon" alt="filterIcon" src={filter} /><img field="user" value={ob.user} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.user}
                    </span>
                }

            },
            {
                dataField: '_source.email',
                text: 'EMAIL',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="email" value={ob.email} className="icon" alt="filterIcon" src={filter} /><img field="email" value={ob.email} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.email}
                    </span>
                }

            },
            {
                dataField: '_source.domain',
                text: 'DOMAIN',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="domain" value={ob.domain} className="icon" alt="filterIcon" src={filter} /><img field="domain" value={ob.domain} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.domain}
                    </span>
                }

            },
            {
                dataField: '_source.level',
                text: 'LEVEL',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="level" value={ob.level} className="icon" alt="filterIcon" src={filter} /><img field="level" value={ob.level} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.level}
                    </span>
                }

            }];
            case 'domains': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.type}
                    </span>
                }
            }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.from}
                    </span>
                }
            }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.to}
                    </span>
                }
            },
            {
                dataField: '_source.tls-cn',
                text: 'TLS-CN',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="tls-cn" value={ob["tls-cn"]} className="icon" alt="filterIcon" src={filter} /><img field="tls-cn" value={ob["tls-cn"]} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob["tls-cn"]}
                    </span>
                }
            }, {
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.source}
                    </span>
                }
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source.filenameDownload',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {ob.attrs.filenameDownload &&
                            <a onClick={this.getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                        }

                        <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                        {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }

                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];
            case 'conference': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                editable: false,
                sort: true,
                text: 'TYPE',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.type}
                    </span>
                }
            }, {
                dataField: '_source.attrs.from',
                editable: false,
                sort: true,
                text: 'FROM',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.from}
                    </span>
                }
            }, {
                dataField: '_source.attrs.to',
                editable: false,
                sort: true,
                text: 'TO',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.to}
                    </span>
                }
            },
            {
                dataField: '_source.attrs.conf_id',
                editable: false,
                sort: true,
                text: 'CONF ID',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.conf_id" value={ob.attrs.conf_id} className="icon" alt="filterIcon" src={filter} /><img field="attrs.conf_id" value={ob.attrs.conf_id} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.conf_id}
                    </span>
                }
            }, {
                dataField: '_source.attrs.source',
                editable: false,
                sort: true,
                text: 'SOURCE',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.source}
                    </span>
                }
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source.filenameDownload',
                editable: false,
                text: 'ADVANCED',
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {ob.attrs.filenameDownload &&
                            <a href={"/traffic_log/" + ob.attrs.filenameDownload} >  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                        }

                        <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                        {ob.attrs.filenameDownload && <a href={"/sd/#/data/traffic_log/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }

                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];

            case 'homeLoginCalls': return [
                {
                    dataField: '_source.@timestamp',
                    text: 'TIMESTAMP',
                    sort: true,
                    editable: false,
                    headerStyle: { width: '170px' },
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return new Date(ob['@timestamp']).toLocaleString();
                    }

                }, {
                    dataField: '_source.attrs.type',
                    text: 'TYPE',
                    editable: false,
                    sort: true,
                    classes: "tabletd",
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >    {ob.attrs.type}
                        </span>
                    }

                }, {
                    dataField: '_source.attrs.from',
                    text: 'FROM',
                    editable: false,
                    sort: true,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >    {ob.attrs.from}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.to',
                    text: 'TO',
                    editable: false,
                    sort: true,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >  {ob.attrs.to}
                        </span>
                    }
                },
                {
                    dataField: '_source.attrs.duration',
                    text: 'DURATION',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.duration" value={ob.attrs.duration} className="icon" alt="filterIcon" src={filter} /><img field="attrs.duration" value={ob.attrs.duration} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >    {this.formatDuration(ob.attrs.duration)}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.source',
                    text: 'SOURCE',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >    {ob.attrs.source}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.rtp-MOScqex-avg',
                    text: 'AVG QoS',
                    sort: true,
                    editable: false,
                    classes: function callback(cell, row, rowIndex, colIndex) { if (cell <= 3) { return "red" }; }
                },
                {
                    dataField: '_source.attrs.sip-code',
                    text: 'SIP CODE',
                    sort: true,
                    editable: false
                }, {
                    dataField: '_source.attrs.tags',
                    text: 'TAGS',
                    sort: true,
                    headerStyle: { width: '150px !important' },
                    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                        <TagRanger tags={this.state.tags} row={row} />
                    ),

                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                        </span>
                    }
                },
                {
                    dataField: '_source.filenameDownload',
                    text: 'ADVANCED',
                    editable: false,
                    headerStyle: { width: '150px' },
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span>
                            {ob.attrs.filenameDownload &&
                                <a onClick={this.getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                            }

                            <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                            {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                            }
                            {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                                {close => (
                                    <div className="Advanced">
                                        <button className="link  close export" onClick={() => this.export(ob)}>
                                            Export json
                            </button>
                                        <button className="close" onClick={close}>
                                            &times;
                            </button>
                                        <div className="contentAdvanced">
                                            <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                        </div>
                                    </div>
                                )}
                            </Popup>
                            }

                        </span>
                    }
                }];
            case 'diagnostics': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >   {ob.attrs.type}
                    </span>
                }
            }, {
                dataField: '_source.attrs.reason',
                editable: false,
                sort: true,
                text: 'REASON'
            }, {
                dataField: '_source.attrs.from',
                editable: false,
                sort: true,
                text: 'FROM',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >  {ob.attrs.from}
                    </span>
                }
            }, {
                dataField: '_source.attrs.to',
                editable: false,
                sort: true,
                text: 'TO',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >   {ob.attrs.to}
                    </span>
                }
            }, {
                dataField: '_source.attrs.source',
                editable: false,
                sort: true,
                text: 'SOURCE',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.source}
                    </span>
                }
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source._id',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {ob.attrs.filenameDownload &&
                            <a onClick={this.getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                        }

                        <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                        {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];

            case 'exceeded': return [
                {
                    dataField: '_source.@timestamp',
                    text: 'TIMESTAMP',
                    sort: true,
                    editable: false,
                    headerStyle: { width: '170px' },
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return new Date(ob['@timestamp']).toLocaleString();
                    }

                }, {
                    dataField: '_source.exceeded',
                    text: 'EXCEEDED',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="exceeded" value={ob.exceeded} className="icon" alt="filterIcon" src={filter} /><img field="exceeded" value={ob.exceeded} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >   {ob.exceeded ? ob.exceeded.toString() : ""}
                        </span>
                    }
                }, {
                    dataField: '_source.el-reason',
                    editable: false,
                    sort: true,
                    headerStyle: { width: '10%' },
                    text: 'REASON',

                }, {
                    dataField: '_source.attrs.from',
                    text: 'FROM',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.from}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.source',
                    text: 'SOURCE',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.source}
                        </span>
                    }
                },
                {
                    dataField: '_source.exceeded-by',
                    text: 'EXCEEDED BY',
                    sort: true,
                    editable: false,
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="exceeded-by" value={ob['exceeded-by']} className="icon" alt="filterIcon" src={filter} /><img field="exceeded-by" value={ob['exceeded-by']} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob['exceeded-by'] ? ob['exceeded-by'].toString() : ""}
                        </span>
                    }
                }, {
                    dataField: '_source.attrs.tags',
                    text: 'TAGS',
                    sort: true,
                    headerStyle: { width: '150px !important' },
                    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                        <TagRanger tags={this.state.tags} row={row} />
                    ),

                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                        </span>
                    }
                },
                {
                    dataField: '_source.filenameDownload',
                    text: 'ADVANCED',
                    editable: false,
                    headerStyle: { width: '150px' },
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        return <span>
                            {ob.attrs.filenameDownload &&
                                <a onClick={this.getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                            }

                            <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                            {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                            }


                            {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                                {close => (
                                    <div className="Advanced">
                                        <button className="link  close export" onClick={() => this.export(ob)}>
                                            Export json
                            </button>
                                        <button className="close" onClick={close}>
                                            &times;
                            </button>
                                        <div className="contentAdvanced">
                                            <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                        </div>
                                    </div>
                                )}
                            </Popup>
                            }
                            {((ob["exceeded-by"].includes("URI") || ob["exceeded-by"].includes("IP")) && !this.isAlreadyExclude(ob)) && <span id={"spanExclude" + ob["id"]}>
                                <img className="icon" alt="excludeIcon" src={excludeIcon} title="exclude" onClick={() => this.openExclude(ob)} />
                                <div id={"popupExclude" + ob["id"]} className="popupTag" style={{ "display": "none", "marginLeft": "-30%", "marginTop": "2%" }}>
                                    <input type="text" id={"input" + ob["id"]} name="name" className="form-control" onKeyUp={(event) => this.onEnterKeyExclude(event, ob)} placeholder="comment" style={{ "display": "inline-table", "height": "30px" }} />
                                    <button type="button" className="btn btn-small btn-primary" onClick={() => this.exclude(ob)}>OK</button><button type="button" className="btn btn-small btn-secondary" style={{ "margin": "0" }} onClick={() => this.closePopupExclude(ob)}>X</button>
                                </div>
                            </span>
                            }
                        </span>
                    }
                }];

            case 'overview': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                editable: false,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.type}
                    </span>
                }
            }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.from}
                    </span>
                }
            }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.to}
                    </span>
                }
            }, {
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.source}
                    </span>
                }
            }, {
                dataField: '_source.attrs.method',
                text: 'METHOD',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.method" value={ob.attrs.method} className="icon" alt="filterIcon" src={filter} /><img field="attrs.method" value={ob.attrs.method} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.method}
                    </span>
                }
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source.filenameDownload',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span>
                        {ob.attrs.filenameDownload &&
                            <a onClick={this.getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                        }
                        <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                        {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link  close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];

            case 'qos': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                editable: false,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.rtp-lossmax',
                editable: false,
                sort: true,
                text: 'RTP LOSSMAX'
            }, {
                dataField: '_source.attrs.rtp-lossavg',
                editable: false,
                sort: true,
                text: 'RTP LOSSAVG'
            }, {
                dataField: '_source.attrs.rtp-MOScqex-min',
                editable: false,
                sort: true,
                text: 'RTP MOSCQEX MIN'
            }, {
                dataField: '_source.attrs.rtp-MOScqex-avg',
                editable: false,
                sort: true,
                text: 'RTP MOSCQEX AVG'
            }, {
                dataField: '_source.attrs.rtp-direction',
                editable: false,
                sort: true,
                text: 'DIRECTION'
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source._id',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];

            case 'registration': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.type}
                    </span>
                }
            }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.from}
                    </span>
                }
            }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.to}
                    </span>
                }
            }, {
                dataField: '_source.attrs.contact',
                text: 'CONTACT',
                editable: false,
                sort: true,
                headerStyle: { width: '17%' }
            }, {
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.source}
                    </span>
                }
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source.filenameDownload',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {ob.attrs.filenameDownload &&
                            <a onClick={this.getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>
                        }

                        <a onClick={() => this.downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></a>

                        {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }

                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];

            case 'security': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.type}
                    </span>
                }
            }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.from" value={ob.attrs.from} className="icon" alt="filterIcon" src={filter} /><img field="attrs.from" value={ob.attrs.from} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.from}
                    </span>
                }
            }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.to" value={ob.attrs.to} className="icon" alt="filterIcon" src={filter} /><img field="attrs.to" value={ob.attrs.to} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.to}
                    </span>
                }
            }, {
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.source}
                    </span>
                }
            }, {
                dataField: '_source.attrs.reason',
                text: 'REASON',
                sort: true,
                editable: false
            },
            {
                dataField: '_source.geoip.country_name',
                text: 'COUNTRY_NAME',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="geoip.country_name" value={ob.geoip.country_name} className="icon" alt="filterIcon" src={filter} /><img field="geoip.country_name" value={ob.geoip.country_name} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.geoip.country_name}
                    </span>
                }
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '100px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];

            case 'transport': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                },
            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.type}
                    </span>
                }
            }, {
                dataField: '_source.attrs.reason',
                editable: false,
                sort: true,
                text: 'REASON'
            }, {
                dataField: '_source.attrs.source',
                editable: false,
                sort: true,
                text: 'SOURCE',

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filter} /><img field="attrs.source" value={ob.attrs.source} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.source}
                    </span>
                }
            }, {
                dataField: '_source.attrs.tags',
                text: 'TAGS',
                sort: true,
                headerStyle: { width: '150px !important' },
                editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                    <TagRanger tags={this.state.tags} row={row} />
                ),

                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filter} /><img field="attrs.tags" value={ob.attrs.tags} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                    </span>
                }
            }, {
                dataField: '_source',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '100px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];

            case 'realm': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.hostname',
                text: 'HOSTNAME',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="attrs.hostname" value={ob.attrs.hostname} className="icon" alt="filterIcon" src={filter} /><img field="attrs.hostname" value={ob.attrs.hostname} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.hostname}
                    </span>
                }
            }, {
                dataField: '_source.attrs.callfrom',
                editable: false,
                sort: true,
                text: 'CALL FROM'
            }, {
                dataField: '_source.attrs.callsto',
                editable: false,
                sort: true,
                text: 'CALL TO'
            }, {
                dataField: '_source.attrs.callstartfrom',
                editable: false,
                sort: true,
                text: 'CALL START FROM'
            }, {
                dataField: '_source.attrs.callstartto',
                editable: false,
                sort: true,
                text: 'CALL START TO'
            }, {
                dataField: '_source.attrs.bitsfrom',
                editable: false,
                sort: true,
                text: 'CALL BITS FROM'
            }, {
                dataField: '_source.attrs.bitsto',
                editable: false,
                sort: true,
                text: 'CALL BITS TO'
            }, {
                dataField: '_source',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '100px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }];


            case 'network': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                editable: false,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    if (ob.attrs) {
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.type}
                        </span>
                    }
                }
            }, {
                dataField: '_source.attrs.hostname',
                text: 'HOSTNAME',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    if (ob.attrs) {
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.hostname" value={ob.attrs.hostname} className="icon" alt="filterIcon" src={filter} /><img field="attrs.hostname" value={ob.attrs.hostname} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.hostname}
                        </span>
                    }
                }
            }, {
                dataField: '_source.type_instance',
                text: 'TYPE INST.',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    if (ob.attrs) {
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="type_instance" value={ob.type_instance} className="icon" alt="filterIcon" src={filter} /><img field="type_instance" value={ob.type_instance} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.type_instance}
                        </span>
                    }
                }
            }, {
                dataField: '_source.plugin_instance',
                text: 'PLUGIN INST.',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    if (ob.attrs) {
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="plugin_instance" value={ob.plugin_instance} className="icon" alt="filterIcon" src={filter} /><img field="plugin_instance" value={ob.plugin_instance} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.plugin_instance}
                        </span>
                    }
                }
            }, {
                dataField: '_source.rx',
                text: 'RX',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source.rx;
                    if (ob) {
                        return Math.round(ob * 100) / 100;
                    }
                    return 0;
                }
            }, {
                dataField: '_source.tx',
                text: 'TX',
                sort: true,
                editable: false,
                formatter: (cell, obj) => {
                    var ob = obj._source.tx;
                    if (ob) {
                        return Math.round(ob * 100) / 100;
                    }
                    return 0;
                }
            }, {
                dataField: '_source.value',
                editable: false,
                sort: true,
                text: 'VALUE'
            }, {
                dataField: '_source',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '100px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }]


            case 'system': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                editable: false,
                sort: true,
                headerStyle: { width: '170px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return new Date(ob['@timestamp']).toLocaleString();
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    if (ob.attrs && ob.attrs.type) {

                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filter} /><img field="attrs.type" value={ob.attrs.type} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.attrs.type}
                        </span>
                    }
                }
            }, {
                dataField: '_source.attrs.hostname',
                text: 'HOSTNAME',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    if (ob.attrs && ob.attrs.hostname) {
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field="attrs.hostname" value={ob.attrs.hostname} className="icon" alt="filterIcon" src={filter} /><img field="attrs.hostname" value={ob.attrs.hostname} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span > {ob.attrs.hostname}
                        </span>
                    }
                }
            }, {
                dataField: '_source.type_instance',
                text: 'TYPE INST.',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={this.filter} field="type_instance" value={ob.type_instance} className="icon" alt="filterIcon" src={filter} /><img field="type_instance" value={ob.type_instance} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >{ob.type_instance}
                    </span>
                }
            }, {
                dataField: '_source.value',
                editable: false,
                sort: true,
                text: 'VALUE'
            }, {
                dataField: '_source.shortterm',
                editable: false,
                text: 'SHORT TERM',
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source.rx;
                    if (ob) {
                        return Math.round(ob * 100) / 100;
                    }
                    return 0;
                }
            }, {
                dataField: '_source.midterm ',
                editable: false,
                text: 'MID TERM',
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source.tx;
                    if (ob) {
                        return Math.round(ob * 100) / 100;
                    }
                    return 0;
                }
            }, {
                dataField: '_source.longterm ',
                editable: false,
                text: 'LONG TERM',
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source.value;
                    if (ob) {
                        return Math.round(ob * 100) / 100;
                    }
                    return 0;
                }
            }, {
                dataField: '_source',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '100px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link close export" onClick={() => this.export(ob)}>
                                        Export json
                            </button>
                                    <button className="close" onClick={close}>
                                        &times;
                            </button>
                                    <div className="contentAdvanced">
                                        <pre> <div dangerouslySetInnerHTML={{ __html: this.syntaxHighlight(ob) }} /></pre>

                                    </div>
                                </div>
                            )}
                        </Popup>
                        }
                    </span>
                }
            }]
        };

    }



    render() {
        var thiss = this;

        //download merge pcaps
        async function getPcaps(event) {
            var selectedData = thiss.state.selected;
            if (selectedData.length === 0) {
                alert("You must select PCAPs to merge.");
            } else { 
                var pcaps = [];
                for (var i = 0; i < selectedData.length; i++) {
                    var record = thiss.getRecord(selectedData[i]);
                    if (record._source.attrs.filename) {
                        pcaps.push("/data/sbcsync/traffic_log/" + record._source.attrs.filename);
                    }
                }

                if (pcaps.length === 0) {
                    alert("You have to choose events with PCAP file.");
                } else if (pcaps.length > 10) {
                    alert("You can choose maximum 10 PCAPs.");
                }
                else {
                    await downloadPcapMerged(pcaps).then(function (data) {
                        if (typeof data === 'string') {
                            alert(data);
                        }
                        else {
                            var blob = new Blob([data], { type: "pcap" });
                            const element = document.createElement("a");
                            element.download = "merge-" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10) + ".pcap";
                            element.href = URL.createObjectURL(blob);
                            document.body.appendChild(element);
                            element.click();
                        }
                    })
                }
            }

        }

        //download all with check        
        async function downloadAllCheck() {
            var selectedData = thiss.state.selected;
            if (selectedData.length === 0) {
                alert("You have to choose events to download.");
            }
            else {
                if (selectedData.length > 10) {
                    document.getElementById("downloadAllTooltip").style.display = "inline";
                    setTimeout(function () {
                        document.getElementById("downloadAllTooltip").style.display = "none";
                    }, 2000);
                    
                }
                var zip = new JSZip();
                for (var i = 0; i < selectedData.length; i++) {
                    var record = thiss.getRecord(selectedData[i]);
                    var filename = record._source.attrs.filename;
                    await downloadPcap(record._source.attrs.filename).then(function (data) {
                        filename = filename ? filename.substring(0, filename.length - 5) : "";
                        filename = filename ? filename.substring(filename.lastIndexOf("/") + 1) : Math.random().toString(36).substring(7);
                        if (typeof data !== 'string') {
                            var blob = new Blob([data], { type: "pcap" });
                            zip.file(filename, blob);
                        }
                        var json = new Blob([JSON.stringify(record)], { type: 'text/plain' });
                        zip.file(filename + ".json", json);
                    })

                    //download sd

                    if (record._source.attrs.filename) {
                        var sd = await downloadSD(record._source.attrs.filename);
                        if (sd && !sd.includes("Error")) {
                            zip.file(filename + ".html", sd);
                        }
                    }

                }
                zip.generateAsync({ type: "blob" })
                    .then(function (blob) {
                        FileSaver.saveAs(blob, "export.zip");
                    });
            }
        }

        //display merge pcaps
        function displayPcaps(event) {
            var selectedData = thiss.state.selected;
            var pcaps = [];
            for (var i = 0; i < selectedData.length; i++) {
                var record = thiss.getRecord(selectedData[i]);
                if (record._source.attrs.filename) {
                    pcaps.push("/data/sbcsync/traffic_log/" + record._source.attrs.filename);
                }
            }
            if (pcaps.length === 0) {
                alert("You have to choose events with PCAP file.");
            } else if (pcaps.length > 8) {
                alert("You can choose maximum 8 PCAPs.");
            }
            else {
                window.open("/sequenceDiagram/?id=" + pcaps.join(','), '_blank');
            }


        }



        function isDisplay(field) {
            var display = getDisplayFields();
            for (var j = 0; j < display.length; j++) {
                if (display[j] === field) {
                    return true;
                }
            }
            return false;
        }


        //this.isAdmin() || isDisplay("attrs."+cell) ?   
        //what render if user click on row
        const expandRow = {
            onExpand: (row, isExpand, rowIndex, e) => {
            },
            renderer: row => (
                <div className="tab">
                    {Object.keys(row._source.attrs).sort().map(cell =>
                        isDisplay("attrs." + cell) ?
                            this.isSearchable("attrs." + cell) ?
                                //if  attrs.rtp-MOScqex-avg: [* TO 3] red
                                cell === "rtp-MOScqex-avg" ?
                                    row._source.attrs[cell] < 3 ?
                                        <p value={row._source.attrs[cell]}>
                                            <span className="spanTab">{cell}:</span>
                                            <span className="red">{row._source.attrs[cell]}</span>
                                        </p>
                                        :
                                        <p value={row._source.attrs[cell]}>
                                            <span className="spanTab">{cell}: </span>
                                            <span className="tab">{row._source.attrs[cell]}</span>
                                        </p>
                                    //attrs.rtp-MOScqex-min : [* TO 2] red
                                    : cell === "rtp-MOScqex-min" ?
                                        row._source.attrs[cell] < 2 ?
                                            <p value={row._source.attrs[cell]}>
                                                <span className="spanTab">{cell}: </span>
                                                <span className="red tab">{row._source.attrs[cell]}</span>
                                            </p>
                                            :
                                            <p value={row._source.attrs[cell]}>
                                                <span className="spanTab">{cell}: </span>
                                                <span className="tab">{row._source.attrs[cell]}</span>
                                            </p>
                                        //attrs.rtp-lossmax: [25 TO *]  red
                                        : cell === "rtp-lossmax" ?
                                            row._source.attrs[cell] > 25 ?
                                                <p value={row._source.attrs[cell]}>
                                                    <span className="spanTab">{cell}: </span>
                                                    <span className="red tab">{row._source.attrs[cell]}</span>
                                                </p>
                                                :
                                                <p value={row._source.attrs[cell]}>
                                                    <span className="spanTab">{cell}: </span>
                                                    <span className="tab">{row._source.attrs[cell]}</span>
                                                </p>
                                            //attrs.rtp-lossavg: [15 TO *] red
                                            : cell === "rtp-lossavg" ?
                                                row._source.attrs[cell] > 15 ?
                                                    <p value={row._source.attrs[cell]}>
                                                        <span className="spanTab">{cell}: </span>
                                                        <span className="red tab">{row._source.attrs[cell]}</span>
                                                    </p>
                                                    :
                                                    <p value={row._source.attrs[cell]}>
                                                        <span className="spanTab">{cell}: </span>
                                                        <span className="tab">{row._source.attrs[cell]}</span>
                                                    </p>

                                                //attrs.rtp-direction:'oneway'  red
                                                : cell === "rtp-direction" ?
                                                    row._source.attrs[cell] === "oneway" ?
                                                        <p value={row._source.attrs[cell]}>
                                                            <span className="spanTab">{cell}: </span>
                                                            <span className="red tab">{row._source.attrs[cell]}</span>
                                                        </p>
                                                        :
                                                        <p value={row._source.attrs[cell]}>
                                                            <span className="spanTab">{cell}: </span>
                                                            <span className="tab">{row._source.attrs[cell]}</span>
                                                        </p>

                                                    :
                                                    <p key={cell} field={"attrs." + cell} value={row._source.attrs[cell]}>
                                                        <span className="spanTab">{cell}: </span>
                                                        <img onClick={this.filter} field={"attrs." + cell} value={row._source.attrs[cell]} title="filter" className="icon" alt="filterIcon" src={filter} />
                                                        <img field={"attrs." + cell} value={row._source.attrs[cell]} onClick={this.unfilter} className="icon" alt="unfilterIcon" title="unfilter" src={unfilter} />
                                                        <span className="spanTab">{row._source.attrs[cell]}</span>

                                                    </p>
                                :
                                //if filename make a link
                                cell === "filename" ?
                                    <p value={row._source.attrs[cell]}> <span className="spanTab">{cell}: </span>
                                        <span className="tab">
                                            <a onClick={this.getPcap} file={row._source.attrs[cell]}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></a>

                                            <a href={"/sequenceDiagram/" + row._source.attrs[cell]} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a></span></p>

                                    :
                                    //if audio_file make download icon (only for call-end)
                                    cell === "audio_file" ?
                                        <p value={row._source.attrs[cell]}> <span className="spanTab">{cell}: </span>
                                            <span className="tab">
                                                <a href={row._source.attrs[cell]} ><img className="icon" alt="wavIcon" title="download WAV" src={downloadIcon} /></a>
                                            </span></p>
                                        :

                                        //if  reg_expire make human-readable format
                                        cell === "reg_expire" || cell === "ua_expire" ?
                                            <p value={row._source.attrs[cell]}>
                                                <span className="spanTab">{cell}: </span>
                                                <span className="tab">{new Date(row._source.attrs[cell] * 1000).toLocaleString()}</span>
                                            </p>
                                            :

                                            //not searchable fields with attrs
                                            <p value={row._source.attrs[cell]}>
                                                <span className="spanTab">{cell}: </span>
                                                <span className="tab">{row._source.attrs[cell]}</span>
                                            </p>
                            :
                            <span />
                    )}

                    { row._source.geoip ?
                        Object.keys(row._source.geoip).sort().map(cell =>
                            isDisplay("geoip." + cell) ?
                                cell === "country_name" ?
                                    <p key={cell} field={"geoip." + cell} value={row._source.geoip[cell]}>
                                        <span className="spanTab">{cell}: </span>
                                        <img onClick={this.filter} field={"geoip." + cell} value={row._source.geoip[cell]} title="filter" className="icon" alt="filterIcon" src={filter} />
                                        <img field={"geoip." + cell} value={row._source.geoip[cell]} onClick={this.unfilter} className="icon" alt="unfilterIcon" title="unfilter" src={unfilter} />
                                        <span className="spanTab">{row._source.geoip[cell]}</span>

                                    </p>
                                    :

                                    <p value={row._source.geoip[cell]}>
                                        <span className="spanTab">{cell}: </span>
                                        <span className="tab">{row._source.geoip[cell]}</span>
                                    </p>
                                : <span />
                        ) : <span />}

                    { this.props.name === "exceeded" || this.props.name === "system" || this.props.name === "network" || this.props.name === "realm" ?
                        Object.keys(row._source).sort().map(cell =>
                            isDisplay(cell) ?
                                <p value={row._source[cell]}>
                                    <span className="spanTab">{cell}: </span>
                                    <span className="tab">{row._source[cell].toString()}</span>
                                </p>
                                : <span />
                        ) : <span />}

                    { //special case: if filename contains "downloadWav" (only for recording) - make a wav link
                        Object.keys(row._source).sort().map(cell =>
                            cell === "downloadWav" ?
                                <p value={row._source[cell]}> <span className="spanTab">{cell}: </span>
                                    <span className="tab">
                                        <a href={row._source[cell]} ><img className="icon" alt="wavIcon" title="download WAV" src={downloadIcon} /></a>

                                    </span></p>
                                : <span />
                        )}


                </div>
            ),
            expandByColumnOnly: true,
            showExpandColumn: true,
            nonExpandable: [1],
            expandHeaderColumnRenderer: ({ isAnyExpands }) => {
                if (isAnyExpands) {
                    return <span>-</span>;
                }
                return <span>+</span>;
            },
            expandColumnRenderer: ({ expanded }) => {
                if (expanded) {
                    return (
                        <span>-</span>
                    );
                }
                return (
                    <span>-</span>
                );
            }
        };

        const NoDataIndication = () => (
            <span className="noDataIcon">
                <img alt="nodata" src={emptyIcon} />
            </span>
        );


        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            clickToEdit: true,
           selected: this.state.selected,
           onSelect: this.handleOnSelect,
           onSelectAll: this.handleOnSelectAll
        }

        const columnsList = this.state.columns;
        var CustomToggleList = ({
            columns,
            onColumnToggle,
            toggles
        }) => (
            <div style={{ "display": "inline-block", "marginLeft": "15px" }} data-toggle="buttons">
                {
                    columns
                        .map(column => ({
                            ...column,
                            toggle: toggles[column.toggles]
                        }))
                        .filter(column => column.dataField !== "_source" && this.props.id !== "LAST LOGIN EVENTS").map(column => (
                            <button
                                type="button"
                                id={column.dataField}
                                key={column.dataField}
                                className={`${!column.hidden ? ' selectColumnButton green' : 'selectColumnButton'}`}
                                data-toggle="button"
                                aria-pressed={column.toggle ? 'true' : 'false'}
                                onClick={() => {
                                    onColumnToggle(column.dataField); if (document.getElementById(column.dataField).classList.contains('green')) {
                                        document.getElementById(column.dataField).classList.remove('green');
                                    }
                                    else {
                                        document.getElementById(column.dataField).classList.add('green');
                                    }
                                    //add change color also to state
                                    var columns = this.state.columns;
                                    for (var i = 0; i < columns.length; i++) {
                                        if (columns[i].dataField === column.dataField) {
                                            columns[i].hidden = columns[i].hidden ? false : true;
                                        }
                                    }
                                    this.setState({ columns: columns });
                                }
                                }>
                                { column.text}
                            </button>

                        ))
                }
            </div>
        );

        const pageButtonRenderer = ({
            page,
            active,
            disable,
            title,
            onPageChange
        }) => {
            const handleClick = (e) => {
                e.preventDefault();
                //if allcheck button is active, check everything
                //if(this.state.checkall){
               // this.rowCheckAll(true);
                // }
                onPageChange(page);
            }
            const activeStyle = {};
            if (active) {
                activeStyle.backgroundColor = 'grey';
                activeStyle.color = 'white';
            } else {
                activeStyle.backgroundColor = 'white';
                activeStyle.color = 'black';
            }
            if (typeof page === 'string') {
                activeStyle.backgroundColor = 'white';
                activeStyle.color = 'black';
            }
            return (
                <li className="page-item" key={page}>
                    <a href="#" onClick={handleClick} className="page-link" style={activeStyle} >{page}</a>
                </li>
            );
        };

        const options = {
            pageButtonRenderer
        };
        return (
            <div key={"table"}>

                {columnsList &&
                    <ToolkitProvider
                        keyField="_id"
                        data={
                            this.state.data
                        }
                        columnToggle
                        columns={
                            this.state.columns
                        }
                        noDataIndication={() => <NoDataIndication />}>

                        {
                            props => (
                                <div key={"tablechart"}>
                                    <h3 className="alignLeft title inline" >{this.props.id}</h3>
                                    {this.props.id !== "LAST LOGIN EVENTS" && <img className="icon" alt="tagIcon" src={tagIcon} title="add tag" onClick={() => this.openPopupTag()} />}

                                    {this.props.id !== "LAST LOGIN EVENTS" && <div id="popupTag" className="popupTag" style={{ "display": "none" }}>
                                        <input type="text" id="tag" name="name" className="form-control" onKeyUp={(event) => this.onEnterKey(event)} style={{ "display": "inline-table", "height": "30px" }} />
                                        <button type="button" className="btn btn-small btn-primary" onClick={() => this.tags()}>OK</button><button type="button" className="btn btn-small btn-secondary" style={{ "margin": "0" }} onClick={() => this.closePopupTag()}>X</button>
                                    </div>}

                                    {(window.location.pathname === "/calls") && <span><img className="icon" alt="viewIcon" onClick={() => displayPcaps()} src={viewIcon} title="view merge PCAPs" />
                                        <img className="icon" alt="downloadIcon" src={downloadPcapIcon} onClick={() => getPcaps()} title="download merge PCAP" />
                                    </span>
                                    }
                                    {this.props.id !== "LAST LOGIN EVENTS" && <a onClick={() => downloadAllCheck()} >  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download check" /><span id="downloadAllTooltip" style={{ "display": "none" }}>Downloading a lot of data, it can take a while.</span></a>}

                                    <span className="smallText"> (total: {this.props.total.toLocaleString()})</span>
                                    <CustomToggleList {...props.columnToggleProps} />
                                    <BootstrapTable {...props.baseProps}
                                        pagination={
                                            paginationFactory(options)
                                        }
                                        bordered={false}
                                        bootstrap4
                                        selectRow={selectRowProp}
                                        hover
                                        printable
                                        expandRow={this.props.id !== "LAST LOGIN EVENTS" ?
                                            expandRow : ""
                                        }
                                        cellEdit={cellEditFactory({
                                            mode: 'click',
                                            blurToSave: true
                                        })}
                                    />

                                </div>
                            )
                        }
                    </ToolkitProvider>


                }
            </div>
        );
    }
}

