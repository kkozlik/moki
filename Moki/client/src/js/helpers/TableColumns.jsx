import React from 'react';
import Popup from "reactjs-popup";
import excludeIcon from "../../styles/icons/exclude.png";
import detailsIcon from "../../styles/icons/details.png";
import TagRanger from "../bars/TagRanger";
import filterIcon from "../../styles/icons/filter.png";
import unfilterIcon from "../../styles/icons/unfilter.png";
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
import { parseTimestamp } from "../helpers/parseTimestamp";
import SimpleSequenceDiagram from "../charts/simpleSequenceDiagram";

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

/*
handle user input on exclude
*/
export const onEnterKeyExclude = (event, ob) => {
    if (event.keyCode === 13) {
        exclude(ob);
    }
}

export function tableColumns(dashboard, tags) {
    var tag = {
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

    //disable tags for end user
    if (storePersistent.getState().user.jwt === "2") { tag = "" };

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
                    return parseTimestamp(new Date(ob['@timestamp']));
                }

            }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                editable: false,
                sort: true,
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span className="filterToggleActive">
                        <span className="filterToggle">
                            <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} />
                            <img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} />
                        </span >{ob.attrs.type}
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
                        <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.from}
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
                        <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.to}
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
                        <img onClick={doFilter} field="attrs.duration" value={ob.attrs.duration} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.duration" value={ob.attrs.duration} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{formatDuration(ob.attrs.duration)}
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
                        <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.source}
                    </span>
                }
            }, {
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
            }, {
                dataField: '_source.filenameDownload',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {

                    var ob = obj._source;
                    return <span>
                        {ob.attrs.filenameDownload &&
                            <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                        }

                        <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                        {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }
                        {ob.dbg.msg_trace && <Popup trigger={<img className="icon" alt="viewIcon" src={viewIcon} title="diagram" />} modal>
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
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        },
        {
            dataField: '_source["tls-cn"]',
            text: 'USER',
            editable: false,
            sort: true,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="tls-cn" value={ob["tls-cn"]} className="icon" alt="filterIcon" src={filterIcon} /><img field="user" value={ob["tls-cn"]} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob["tls-cn"]}
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
                    <img onClick={doFilter} field="email" value={ob.email} className="icon" alt="filterIcon" src={filterIcon} /><img field="email" value={ob.email} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.email}
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
                    <img onClick={doFilter} field="domain" value={ob.domain} className="icon" alt="filterIcon" src={filterIcon} /><img field="domain" value={ob.domain} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.domain}
                </span>
            }

        },
        {
            dataField: '_source.source',
            text: 'SOURCE',
            editable: false,
            sort: true,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="source" value={ob.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="domain" value={ob.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.source}
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
                    <img onClick={doFilter} field="level" value={ob.level} className="icon" alt="filterIcon" src={filterIcon} /><img field="level" value={ob.level} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.level}
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        }, {
            dataField: '_source.attrs.type',
            text: 'TYPE',
            editable: false,
            sort: true,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.type}
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
                    <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.from}
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
                    <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.to}
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
                    <img onClick={doFilter} field="tls-cn" value={ob["tls-cn"]} className="icon" alt="filterIcon" src={filterIcon} /><img field="tls-cn" value={ob["tls-cn"]} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob["tls-cn"]}
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
                    <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.source}
                </span>
            }
        }, {
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
        }, {
            dataField: '_source.filenameDownload',
            text: 'ADVANCED',
            editable: false,
            headerStyle: { width: '150px' },
            formatter: (cell, obj) => {

                var ob = obj._source;
                return <span>
                    {ob.attrs.filenameDownload &&
                        <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                    }

                    <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                    {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                    }

                    {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        }, {
            dataField: '_source.attrs.type',
            editable: false,
            sort: true,
            text: 'TYPE',
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.type}
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
                    <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.from}
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
                    <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.to}
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
                    <img onClick={doFilter} field="attrs.conf_id" value={ob.attrs.conf_id} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.conf_id" value={ob.attrs.conf_id} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.conf_id}
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
                    <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.source}
                </span>
            }
        }, {
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

                    <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                    {ob.attrs.filenameDownload && <a href={"/sd/#/data/traffic_log/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                    }

                    {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
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
                    return parseTimestamp(new Date(ob['@timestamp']));
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
                        <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >    {ob.attrs.type}
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
                        <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >    {ob.attrs.from}
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
                        <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >  {ob.attrs.to}
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
                        <img onClick={doFilter} field="attrs.duration" value={ob.attrs.duration} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.duration" value={ob.attrs.duration} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >    {formatDuration(ob.attrs.duration)}
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
                        <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >    {ob.attrs.source}
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
                            <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                        }

                        <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                        {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }
                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link  close export" onClick={() => exportJSON(ob)}>
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        }, {
            dataField: '_source.attrs.type',
            text: 'TYPE',
            editable: false,
            sort: true,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >   {ob.attrs.type}
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
                    <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >  {ob.attrs.from}
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
                    <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >   {ob.attrs.to}
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
                    <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.source}
                </span>
            }
        }, {
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
        }, {
            dataField: '_source._id',
            text: 'ADVANCED',
            editable: false,
            headerStyle: { width: '150px' },
            formatter: (cell, obj) => {

                var ob = obj._source;
                return <span>
                    {ob.attrs.filenameDownload &&
                        <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                    }

                    <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                    {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                    }
                    {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
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
                    return parseTimestamp(new Date(ob['@timestamp']));
                }

            }, {
                dataField: '_source.exceeded',
                text: 'EXCEEDED',
                sort: true,
                editable: false,
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
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={doFilterRaw} field="exceeded" value={value} className="icon" alt="filterIcon" src={filterIcon} /><img field="exceeded" value={notvalue} onClick={doFilterRaw} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >   {ob.exceeded ? ob.exceeded.toString() : ""}
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
                        <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.from}
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
                        <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.source}
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
            },
            tag,
            {
                dataField: '_source.filenameDownload',
                text: 'ADVANCED',
                editable: false,
                headerStyle: { width: '150px' },
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    return <span>
                        {ob.attrs.filenameDownload &&
                            <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                        }

                        <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                        {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                        }


                        {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                            {close => (
                                <div className="Advanced">
                                    <button className="link  close export" onClick={() => exportJSON(ob)}>
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
                        {(ob["exceeded-by"].includes("URI") || ob["exceeded-by"].includes("IP")) && <span id={"spanExclude" + ob["id"]}>
                            <img className="icon" alt="excludeIcon" src={excludeIcon} title="exclude" onClick={() => openExclude(ob)} />
                            <div id={"popupExclude" + ob["id"]} className="popupTag" style={{ "display": "none", "marginLeft": "-30%", "marginTop": "2%" }}>
                                <input type="text" id={"input" + ob["id"]} name="name" className="form-control" onKeyUp={(event) => onEnterKeyExclude(event, ob)} placeholder="comment" style={{ "display": "inline-table", "height": "30px" }} />
                                <button type="button" className="btn btn-small btn-primary" onClick={() => exclude(ob)}>OK</button><button type="button" className="btn btn-small btn-secondary" style={{ "margin": "0" }} onClick={() => closePopupExclude(ob)}>X</button>
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        }, {
            dataField: '_source.attrs.type',
            text: 'TYPE',
            sort: true,
            editable: false,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.type}
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
                    <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.from}
                </span>
            },
        }, {
            dataField: '_source.attrs.to',
            text: 'TO',
            sort: true,
            editable: false,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.to}
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
                    <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.source}
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
                    <img onClick={doFilter} field="attrs.method" value={ob.attrs.method} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.method" value={ob.attrs.method} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.method}
                </span>
            }
        }, {
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
        }, {
            dataField: '_source.filenameDownload',
            text: 'ADVANCED',
            editable: false,
            headerStyle: { width: '150px' },
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span>
                    {ob.attrs.filenameDownload &&
                        <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                    }
                    <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                    {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>}
                    {ob.dbg.msg_trace && <Popup trigger={<img className="icon" alt="viewIcon" src={viewIcon} title="diagram" />} modal>
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
                    {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
                        {close => (
                            <div className="Advanced">
                                <button className="link  close export" onClick={() => exportJSON(ob)}>
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
                return parseTimestamp(new Date(ob['@timestamp']));
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
                <TagRanger tags={tags} row={row} />
            ),

            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.tags" value={ob.attrs.tags} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.tags" value={ob.attrs.tags} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.tags ? ob.attrs.tags.toString() : []}
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        }, {
            dataField: '_source.attrs.type',
            text: 'TYPE',
            editable: false,
            sort: true,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.type}
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
                    <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.from}
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
                    <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.to}
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
                    <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.source}
                </span>
            }
        }, {
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
        }, {
            dataField: '_source.filenameDownload',
            text: 'ADVANCED',
            editable: false,
            headerStyle: { width: '150px' },
            formatter: (cell, obj) => {

                var ob = obj._source;
                return <span>
                    {ob.attrs.filenameDownload &&
                        <button className="noFormatButton" onClick={getPcap} file={ob.attrs.filenameDownload}>  <img className="icon" alt="downloadIcon" src={downloadPcapIcon} title="download PCAP" /></button>
                    }

                    <button className="noFormatButton" onClick={() => downloadAll(ob)} file={ob.attrs.filenameDownload} data={obj}>  <img className="icon" alt="downloadIcon" src={downloadIcon} title="download all" /></button>

                    {ob.attrs.filenameDownload && <a href={"/sequenceDiagram/" + ob.attrs.filenameDownload} target="_blank" rel="noopener noreferrer"><img className="icon" alt="viewIcon" src={viewIcon} title="view PCAP" /></a>
                    }

                    {ob.dbg.msg_trace && <Popup trigger={<img className="icon" alt="viewIcon" src={viewIcon} title="diagram" />} modal>
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
                    {<Popup trigger={<img className="icon" alt="detailsIcon" src={detailsIcon} title="details" />} modal>
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        }, {
            dataField: '_source.attrs.type',
            text: 'TYPE',
            sort: true,
            editable: false,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.type}
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
                    <img onClick={doFilter} field="attrs.from.keyword" value={ob.attrs.from} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.from.keyword" value={ob.attrs.from} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.from}
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
                    <img onClick={doFilter} field="attrs.to.keyword" value={ob.attrs.to} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.to.keyword" value={ob.attrs.to} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.to}
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
                    <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.source}
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
                    <img onClick={doFilter} field="geoip.country_name" value={ob.geoip.country_name} className="icon" alt="filterIcon" src={filterIcon} /><img field="geoip.country_name" value={ob.geoip.country_name} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.geoip.country_name}
                </span>
            }
        }, {
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
                return parseTimestamp(new Date(ob['@timestamp']));
            },
        }, {
            dataField: '_source.attrs.type',
            text: 'TYPE',
            editable: false,
            sort: true,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.type}
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
                    <img onClick={doFilter} field="attrs.source" value={ob.attrs.source} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.source" value={ob.attrs.source} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.source}
                </span>
            }
        }, {
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
                return parseTimestamp(new Date(ob['@timestamp']));
            }

        }, {
            dataField: '_source.attrs.hostname',
            text: 'HOSTNAME',
            editable: false,
            sort: true,
            formatter: (cell, obj) => {
                var ob = obj._source;
                return <span className="filterToggleActive"><span className="filterToggle">
                    <img onClick={doFilter} field="attrs.hostname" value={ob.attrs.hostname} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.hostname" value={ob.attrs.hostname} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.hostname}
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
                return parseTimestamp(new Date(ob['@timestamp']));
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
                        <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.type}
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
                        <img onClick={doFilter} field="attrs.hostname" value={ob.attrs.hostname} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.hostname" value={ob.attrs.hostname} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.hostname}
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
                        <img onClick={doFilter} field="type_instance" value={ob.type_instance} className="icon" alt="filterIcon" src={filterIcon} /><img field="type_instance" value={ob.type_instance} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.type_instance}
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
                        <img onClick={doFilter} field="plugin_instance" value={ob.plugin_instance} className="icon" alt="filterIcon" src={filterIcon} /><img field="plugin_instance" value={ob.plugin_instance} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.plugin_instance}
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
                </span>
            }
        }]

        case 'report': return [{
            dataField: '_source.ts-start',
            text: 'START TIME',
            sort: true,
            editable: false,
            headerStyle: { width: '170px' },
            formatter: (cell, obj) => {
                var ob = obj._source;
                return parseTimestamp(new Date(parseInt(ob['ts-start'])));
            }
        }, {
            dataField: '_source.tls-cn',
            text: 'TLS-CN',
            sort: true,
            editable: false,
            formatter: (cell, obj) => {
                var ob = obj._source;
                if (ob) {
                    return <span className="filterToggleActive"><span className="filterToggle">
                        <img onClick={doFilter} field="tls-cn" value={ob["tls-cn"]} className="icon" alt="filterIcon" src={filterIcon} /><img field="tls-cn" value={ob["tls-cn"]} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob["tls-cn"]}
                    </span>
                }
            }
        }, {
            dataField: '_source.count',
            text: 'COUNT',
            sort: true,
            editable: false,
        }, {
            dataField: '_source.period',
            text: 'PERIOD',
            sort: true,
            editable: false
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
                return parseTimestamp(new Date(ob['@timestamp']));
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
                        <img onClick={doFilter} field="attrs.type" value={ob.attrs.type} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.type" value={ob.attrs.type} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.attrs.type}
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
                        <img onClick={doFilter} field="attrs.hostname" value={ob.attrs.hostname} className="icon" alt="filterIcon" src={filterIcon} /><img field="attrs.hostname" value={ob.attrs.hostname} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span > {ob.attrs.hostname}
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
                    <img onClick={doFilter} field="type_instance" value={ob.type_instance} className="icon" alt="filterIcon" src={filterIcon} /><img field="type_instance" value={ob.type_instance} onClick={doUnfilter} className="icon" alt="unfilterIcon" src={unfilterIcon} /></span >{ob.type_instance}
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
                </span>
            }
        }]
    };

}
