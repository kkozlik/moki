import React from 'react';
import Popup from "reactjs-popup";
import detailsIcon from "../../styles/icons/details.png";
import TagRanger from "../bars/TagRanger";
import filterIcon from "../../styles/icons/filter.png";
import shareIcon from "../../styles/icons/share_dark.png";
import unfilterIcon from "../../styles/icons/unfilter.png";
import alertProfileIcon from "../../styles/icons/alertProfile.png";
import AlertProfile from "../helpers/alertProfile";
import downloadPcapIcon from "../../styles/icons/downloadPcap.png";
import downloadIcon from "../../styles/icons/download.png";
import viewIcon from "../../styles/icons/view.png";
import { createFilter } from "@moki-client/gui"
import { formatDuration } from "./getDurationFormat";
import { downloadAll } from "./download/downloadAll";
import { exportJSON } from "./export";
import { getPcap } from './getPcap';
import { exclude } from './exclude';
import storePersistent from "../store/indexPersistent";
import store from "../store/index";
import { parseTimestamp } from "../helpers/parseTimestamp";
import SimpleSequenceDiagram from "../charts/simpleSequenceDiagram";
import { getSearchableAttributes } from '@moki-client/gui';
import { getExceededName } from '@moki-client/gui';

/*
create new filter based on html tag with field with attribute as name 
*/
export const doFilter = (event) => {
    createFilter(event.currentTarget.getAttribute('field') + ":\"" + event.currentTarget.getAttribute('value') + "\"");
}
/*
create raw new filter without changing it's value
*/
export const doFilterRaw = (event) => {
    createFilter(event.currentTarget.getAttribute('value'));
}

/*
same as above but unfilter 
*/
export const doUnfilter = (event) => {
    createFilter("NOT " + event.currentTarget.getAttribute('field') + ":\"" + event.currentTarget.getAttribute('value') + "\"");
}

/*
show exclude popup
*/
export const openExclude = (i) => {
    document.getElementById("popupExclude" + i.id).style.display = "inline";
    document.getElementById("input" + i.id).focus();
}

export const closePopupExclude = (i) => {
    document.getElementById("popupExclude" + i.id).style.display = "none";
}

//json syntax highlight
export const syntaxHighlight = (json) => {
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

        return '<span class="rowSplit ' + cls + '">' + match + '</span>';
    });
}


const shareEvent = (id) => {
    let href = window.location.origin + window.location.pathname + "?from=" + store.getState().timerange[0] + "&to=" + store.getState().timerange[1];

    //put it into clipboard
    let dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = href + "&filter=_id:" + id;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    document.getElementById("tooltipshareFilter" + id).style.display = "inline";
    setTimeout(function () {
        document.getElementById("tooltipshareFilter" + id).style.display = "none";
    }, 1000);
}

/*
handle user input on exclude
*/
export const onEnterKeyExclude = (event, ob) => {
    if (event.keyCode === 13) {
        exclude(ob);
    }
}

// check if column width is stored in local storage
function getColumnWidth(column, width = 0) {
    var dashboard = window.location.pathname.substring(1);
    var columns = JSON.parse(window.localStorage.getItem("columns"));
    if (columns && columns[dashboard] && columns[dashboard][column]) {
        return columns[dashboard][column];
    }
    else {
        if (width !== 0) {
            return width;
        }
        else {
            return "auto";
        }
    }
}

function getColumn(column_name, tags, tag) {
    switch (column_name.source) {
        case '_id': return {
            dataField: '_source._id',
            text: 'ID',
            hidden: true,
            isKey: true
        }
        //different fields for reason
        case 'attrs.reason': return {
            dataField: '_source.attrs.reason',
            editable: false,
            headerStyle: { width: getColumnWidth("REASON") },
            sort: true,
            text: 'REASON',
            formatter: (cell, obj) => {
                var ob = obj._source;
                if (ob.attrs.type === "parse-error") {
                    return ob.err_info;
                }
                else {
                    return ob.attrs.reason;
                }
            }
        }
        case 'exceeded': return {
            dataField: '_source.exceeded',
            text: 'EXCEEDED',
            sort: true,
            editable: false,
            headerStyle: { width: getColumnWidth("EXCEEDED") },
            formatter: (cell, obj) => {
                var ob = obj._source;
                var value = "";
                var notvalue = "";
                for (var i = 0; i < ob.exceeded.length; i++) {
                    if (i === 0) {
                        value = "exceeded: " + ob.exceeded[i];
                        notvalue = "NOT (exceeded: " + ob.exceeded[i];
                    }
                    else {
                        value = value + " AND exceeded:" + ob.exceeded[i];
                        notvalue = notvalue + " AND exceeded:" + ob.exceeded[i];
                    }
                }
                notvalue = notvalue + ")";

                var exceededName = ob.exceeded ? ob.exceeded.toString() : "";
                    exceededName = getExceededName(exceededName);

                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilterRaw} field="exceeded" value={value} className="icon" alt="filterIcon" src={filterIcon} /><img field="exceeded" value={notvalue} onClick={doFilterRaw} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >   {exceededName}
                </span>
            }
        }
        //array format concat
        case 'exceeded-by': return {
            dataField: '_source.exceeded-by',
            text: 'EXCEEDED BY',
            sort: true,
            editable: false,
            headerStyle: { width: getColumnWidth("EXCEEDED BY") },
            formatter: (cell, obj) => {

                var ob = obj._source;
                if (ob["exceeded-by"]) {
                    var value = "";
                    var notvalue = "";
                    for (var i = 0; i < ob["exceeded-by"].length; i++) {
                        if (i === 0) {
                            value = "exceeded-by: " + ob["exceeded-by"][i];
                            notvalue = "NOT (exceeded-by: " + ob["exceeded-by"][i];
                        }
                        else {
                            value = value + " AND exceeded-by:" + ob["exceeded-by"][i];
                            notvalue = notvalue + " AND exceeded-by:" + ob["exceeded-by"][i];
                        }
                    }
                    notvalue = notvalue + ")";
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={doFilterRaw} field="exceeded-by" value={value} className="icon" alt="filterIcon" src={filterIcon} /><img field="exceeded-by" value={notvalue} onClick={doFilterRaw} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob['exceeded-by'] ? ob['exceeded-by'].toString() : ""}
                    </span>
                }
            }
        }
        //special time format
        case 'attrs.duration': return {
            dataField: '_source.attrs.duration',
            text: 'DURATION',
            sort: true,
            editable: false,
            headerStyle: { width: getColumnWidth("DURATION") },
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.duration" value={ob.attrs.duration} className="icon" alt="filterIcon" src={filterIcon} />
                    <img field="attrs.duration" value={ob.attrs.duration} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} />
                </span >{formatDuration(ob.attrs.duration)}
                </span>
            }
        }
        case 'attrs.tags': if (tag) return {
            dataField: '_source.attrs.tags',
            text: 'TAGS',
            sort: true,
            headerStyle: { width: '150px !important' },
            editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => (
                <TagRanger tags={tags} row={row} />
            ),
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.tags" value={ob.attrs.tags} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
                </span>
            }
        }
        //different color
        case 'attrs.rtp-MOScqex-avg': return {
            dataField: '_source.attrs.rtp-MOScqex-avg',
            text: 'AVG QoS',
            sort: true,
            headerStyle: { width: getColumnWidth("AVG QoS") },
            editable: false,
            classes: function callback(cell, row, rowIndex, colIndex) { if (cell <= 3) { return "red" }; }
        }
        case 'advanced': return {
            dataField: '_source',
            text: column_name.name.toUpperCase(),
            editable: false,
            headerStyle: { width: "150px !important" },
            formatter: (cell, obj) => {

                var ob = obj._source;
                return <span>
                    {(ob.attrs.filenameDownload && column_name.icons.includes("download")) &&
                        <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                    }

                    {(ob.attrs.filenameDownload && column_name.icons.includes("downloadAll")) &&
                        <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>
                    }
                     {(ob.attrs.filenameDownload && column_name.icons.includes("diagram") && storePersistent.getState().user.aws === false) && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>}
                    {(ob.dbg && ob.dbg.msg_trace && column_name.icons.includes("diagram")) && <Popup trigger={<img className="icon" alt="viewIcon" src={viewIcon} title="diagram" />} modal>
                        {close => (
                            <div className="Advanced">
                                <button className="close" onClick={close}>
                                    &times;
                                </button>
                                <div className="contentAdvanced" style={{ "padding": "0px" }}>
                                    <SimpleSequenceDiagram data={ob} />
                                </div>
                            </div>
                        )}
                    </Popup>
                    }
                     {(storePersistent.getState().user.aws === true) && <Popup trigger={<img className="icon" alt="alertProfileIcon" src={alertProfileIcon} title="alert profile" />} modal>
                        {close => (
                            <div className="Advanced">
                                <div className="contentAdvanced" style={{ "padding": "0px" }}>
                                    <AlertProfile data={ob} />
                                </div>
                            </div>
                        )}
                    </Popup>
                    }
                    {column_name.icons.includes("details") && <Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                        {close => (
                            <div className="Advanced">
                                <button className="link close export" onClick={() => exportJSON(ob)}>
                                    Export json
                                </button>
                                <button className="close" onClick={close}>
                                    &times;
                                </button>
                                <div className="contentAdvanced">
                                    <pre> <div dangerouslySetInnerHTML={{ __html: syntaxHighlight(ob) }} /></pre>

                                </div>
                            </div>
                        )}
                    </Popup>
                    }
                    {(obj._id && column_name.icons.includes("share")) &&
                        <button className="noFormatButton" onClick={() => shareEvent(obj._id)}>  <img className="icon" alt="shareIcon" src={shareIcon} title="copy event link to share" /><span id={"tooltipshareFilter" + obj._id} style={{ "display": "none", "marginTop": "8px", "position": "absolute", "backgroundColor": "white" }}>Copied to clipboard</span></button>
                    }
                </span>
            }
        }
        //default case with searchable icons and not searchable
        default:
            //fnc case - round
            if (column_name.fnc && column_name.fnc === "round") {
                return {
                    dataField: '_source.' + column_name.source,
                    text: column_name ? column_name.name.toUpperCase() : "",
                    sort: true,
                    editable: false,
                    headerStyle: { width: getColumnWidth(column_name.source) },
                    formatter: (cell, obj) => {
                        var ob = obj._source[column_name.source]
                        if (ob) {
                            return Math.round(ob * 100) / 100;
                        }
                        return 0;
                    }
                }
            }
            //time format
            else if (column_name.fnc && column_name.fnc === "time") {
                return {
                    dataField: '_source.' + column_name.source,
                    text: column_name ? column_name.name.toUpperCase() : "",
                    editable: false,
                    sort: true,
                    headerStyle: { width: '170px' },
                    formatter: (cell, obj) => {
                        var ob = obj._source[column_name.source];
                        if(parseTimestamp(ob) !== "Invalid date" ){
                            return parseTimestamp(ob)
                        }
                        else {
                            return parseTimestamp(new Date(parseInt(ob)));
                        }
                    }
                }
            }
            else if (getSearchableAttributes().includes(column_name.source)) {
                return {
                    dataField: '_source.' + column_name.source,
                    text: column_name ? column_name.name.toUpperCase() : "",
                    editable: false,
                    sort: true,
                    headerStyle: { width: getColumnWidth(column_name.source) },
                    formatter: (cell, obj) => {
                        var ob = obj._source;
                        try {
                            var value = column_name.source.split('.').reduce((o, i) => o[i], ob);
                        }
                        catch { }
                        if (value) {
                            return <span className="filterToggleActive">
                                <span className="filterToggle">
                                    <img onClick={doFilter} field={column_name.source} value={value} className="icon" alt="filterIcon" src={filterIcon} />
                                    <img field={column_name.source} value={value} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} />
                                </span >{value}
                            </span>
                        }
                    }
                }
            }
            else {
                return {
                    dataField: '_source.' + column_name.source,
                    text: column_name ? column_name.name.toUpperCase() : "",
                    editable: false,
                    sort: true,
                    headerStyle: { width: getColumnWidth(column_name.source) }
                }
            }
    }
}

export function tableColumns(dashboard, tags) {

    var tag = true;
    //disable tags for end user
    if (storePersistent.getState().user.jwt === "2") { tag = false };

    let layout = storePersistent.getState().layout.table.columns;
    let columns = [];
    for (const column of layout[dashboard]) {
        columns.push(getColumn(column, tags, tag));
    }
    return columns;
}
