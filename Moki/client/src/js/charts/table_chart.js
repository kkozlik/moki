
/*
Get call table

it is seperate request from call charts
*/
import React, {
    Component
} from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { getSearchableFields } from "../helpers/SearchableFields.js";
import { getDisplayFields } from "../helpers/DisplayFields.js";
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import filter from "../../styles/icons/filter.png";
import unfilter from "../../styles/icons/unfilter.png";
import { createFilter } from '@moki-client/gui';
import emptyIcon from "../../styles/icons/empty.png";
import tagIcon from "../../styles/icons/tag.png";
import downloadIcon from "../../styles/icons/download.png";
import downloadPcapIcon from "../../styles/icons/downloadPcap.png";
import viewIcon from "../../styles/icons/view.png";
import storePersistent from "../store/indexPersistent";
import { elasticsearchConnection } from '../helpers/elasticsearchConnection';
import { downloadPcap } from '../helpers/download/downloadPcap';
import { downloadSD } from '../helpers/download/downloadSD';
import { tableColumns } from '../helpers/TableColumns';
import { getPcap } from '../helpers/getPcap.js';
import { downloadPcapMerged } from '../helpers/download/downloadPcapMerged';
var FileSaver = require('file-saver');
var JSZip = require("jszip");

export default class listChart extends Component {
    constructor(props) {
        super(props);

        const columns = tableColumns(this.props.name, this.props.tags);
        //get columns name from layout 
        var name = window.location.pathname.substring(1);
        var layout = storePersistent.getState().layout.table;
        var searchable = layout[name] ? layout[name] : layout.default;
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
                        return <span className="filterToggleActive"><span className="filterToggle">
                            <img onClick={this.filter} field={formatExtraData} value={cell} className="icon" alt="filterIcon" src={filter} /><img field={formatExtraData} value={cell} onClick={this.unfilter} className="icon" alt="unfilterIcon" src={unfilter} /></span >    {cell}
                        </span>
                    }
                });
        }

        this.state = {
            columns: columns,
            data: [],
            excludeList: [],
            selectedRowsList: [],
            tags: this.props.tags,
            checkall: false,
            selected: []
        }

        this.filter = this.filter.bind(this);
        this.unfilter = this.unfilter.bind(this);
        this.tags = this.tags.bind(this);
        this.movetooltip = this.movetooltip.bind(this);
        this.onEnterKey = this.onEnterKey.bind(this);
        this.handleOnSelect = this.handleOnSelect.bind(this);
        this.handleOnSelectAll = this.handleOnSelectAll.bind(this);
        this.getRecord = this.getRecord.bind(this);



    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.data !== prevState.data) {
            return { data: nextProps.data };
        }
        if (nextProps.tags !== prevState.tags) {
            return { tags: nextProps.tags };
        }
        else return null;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.setState({ data: this.props.data });
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
    async componentDidMount() {


        //store already exclude alarms list
        if (window.location.pathname === "/exceeded") {
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
    }

    //check if alarms is already exclude -> don't display exclude icon
    isAlreadyExclude(ob) {
        var excludeList = this.state.excludeList;
        for (var i = 0; i < excludeList.length; i++) {
            //ob.exceeded + "_exclude" === excludeList[i].attribute
            var filterExclude = ob.exceeded.filter(ex => ex + "_exclude" === excludeList[i].attribute);
            if (excludeList[i].attribute === ob.exceeded + "_exclude" || (Array.isArray(ob.exceeded) && filterExclude.length > 0)) {
                if (excludeList[i].category === "URI") {
                    if (excludeList[i].value.includes(ob.attrs.from)) return true;
                }
            } else if (excludeList[i].category === "IP") {
                if (excludeList[i].value.includes(ob.attrs.source)) return true;
            }
        }
        return false;

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


    getRecord(id) {
        var data = this.state.data;
        for (var i = 0; i < data.length; i++) {
            if (data[i]._id === id) return data[i];
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
                    result = await elasticsearchConnection("/api/tag", { id: record['_id'], index: record['_index'], tags: tags });
                }
                else {
                    result = await elasticsearchConnection("/api/tag", { id: record['_id'], index: record['_index'], tags: tag });
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

    closePopupTag() {
        document.getElementById("popupTag").style.display = "none";
    }

    isAdmin() {
        var aws = storePersistent.getState().user.aws;
        if (aws === true) {

            var user = document.getElementById("user").innerHTML;
            if (user.includes("ADMIN")) {
                return true;
            }
        }
        return false;
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

                                                    //attrs.to or attrs.from, use keyword 
                                                    : cell === "from" || cell === "to" ?
                                                        <p key={cell} field={"attrs." + cell+".keyword"} value={row._source.attrs[cell]}>
                                                            <span className="spanTab">{cell}: </span>
                                                            <img onClick={this.filter} field={"attrs." + cell+".keyword"} value={row._source.attrs[cell]} title="filter" className="icon" alt="filterIcon" src={filter} />
                                                            <img field={"attrs." + cell+".keyword"} value={row._source.attrs[cell]} onClick={this.unfilter} className="icon" alt="unfilterIcon" title="unfilter" src={unfilter} />
                                                            <span className="spanTab">{row._source.attrs[cell]}</span>
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
                                            <button className="noFormatButton" onClick={getPcap} file={row._source.attrs[cell]}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>

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
                                key={column.dataField + this.props.name}
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
                    <button onClick={handleClick} className="noFormatButton page-link" style={activeStyle} >{page}</button>
                </li>
            );
        };

        const options = {
            pageButtonRenderer
        };
        return (
            <div key={"table" + this.props.name}>

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
                                    {this.props.id !== "LAST LOGIN EVENTS" && <button className="noFormatButton" onClick={() => downloadAllCheck()} >  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download check" /><span id="downloadAllTooltip" style={{ "display": "none" }}>Downloading a lot of data, it can take a while.</span></button>}

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

