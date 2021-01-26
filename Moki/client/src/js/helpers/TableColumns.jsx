import React, {
    Component
} from 'react';

class TableColumns extends Component{

    
tableColumns(dashboard){
    switch (dashboard){
    case 'calls': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                headerStyle: {width: '27%'}
    }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                headerStyle: {width: '27%'}
    },
            {
                dataField: '_source.attrs.durationMin',
                text: 'DURATION',
                sort: true,
                headerStyle: {width: '10%'}
    }, {
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                headerStyle: {width: '14%'}
    }],
    case 'homeLoginCalls':  return [
        {
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                headerStyle: {width: '7%'},
                classes: "tabletd",
                sort: true,
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true
    }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
    },
            {
                dataField: '_source.attrs.durationMin',
                text: 'MINUTES',
                headerStyle: {width: '7%'},
                sort: true,
    }, {
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
    },{
                dataField: '_source.attrs.rtp-MOScqex-avg',
                text: 'AVG QoS',
                headerStyle: {width: '7%'},
                sort: true,
                classes: function callback(cell, row, rowIndex, colIndex) { if(cell <=3) { return "red"};  }
    },
    {
                dataField: '_source.attrs.sip-code',
                text: 'SIP CODE',
                headerStyle: {width: '7%'},
                sort: true,
    },
   /* {
                dataField: '_source.filenameDownload',
                text: 'PCAP',
                formatter: (cell, obj) => {
                    var ob = obj._source;
                    //<span><a href={"/traffic_log/"+obj}>Download</a></span>
                   
                   return "<a href='/traffic_log/'"+ob+">Download</a>"
                }
    }*/],
    case 'diagnostics': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                 formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.reason',
                text: 'REASON',
                sort: true,
                headerStyle: {width: '27%'}
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                headerStyle: {width: '18%'}
    }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                headerStyle: {width: '18%'}
    },{
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                headerStyle: {width: '14%'}
    }],
    case 'exceeded': return  [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                 formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.exceeded',
                text: 'EXCEEDED',
                sort: true,
                headerStyle: {width: '10%'}
    }, {
                dataField: '_source.el-reason',
                text: 'REASON',
                sort: true,
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
    },{
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
    }],
    case 'overview': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                headerStyle: {width: '19%'}
    }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                headerStyle: {width: '19%'}
    },{
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                headerStyle: {width: '14%'}
    },{
                dataField: '_source.attrs.method',
                text: 'METHOD',
                sort: true,
                headerStyle: {width: '12%'}
    }],
    case 'qos': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                 formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.rtp-lossmax',
                text: 'RTP LOSSMAX',
                sort: true,
                headerStyle: {width: '14%'}
    }, {
                dataField: '_source.attrs.rtp-lossavg',
                text: 'RTP LOSSAVG',
                sort: true,
                headerStyle: {width: '14%'}
    }, {
                dataField: '_source.attrs.rtp-MOScqex-min',
                text: 'RTP MOSCQEX MIN',
                sort: true,
                headerStyle: {width: '14%'}
    },{
                dataField: '_source.attrs.rtp-MOScqex-avg',
                text: 'RTP MOSCQEX AVG',
                sort: true,
                headerStyle: {width: '14%'}
    },{
                dataField: '_source.attrs.rtp-direction',
                text: 'DIRECTION',
                sort: true,
                headerStyle: {width: '14%'}
    }],
   case 'registration':  return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                 formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                headerStyle: {width: '17%'}
    }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                headerStyle: {width: '17%'}
    },{
                dataField: '_source.attrs.contact',
                text: 'CONTACT',
                sort: true,
                headerStyle: {width: '17%'}
    },{
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                headerStyle: {width: '10%'}
    }],
   case 'security': return  [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                headerStyle: {width: '18%'}
    }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                headerStyle: {width: '18%'}
    },{
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                headerStyle: {width: '14%'}
    },{
                dataField: '_source.attrs.reason',
                text: 'REASON',
                sort: true,
                headerStyle: {width: '15%'}
    }],
   case 'toplist': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                 formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.from',
                text: 'FROM',
                sort: true,
                headerStyle: {width: '10%'}
    }, {
                dataField: '_source.attrs.to',
                text: 'TO',
                sort: true,
                headerStyle: {width: '27%'}
    },{
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                headerStyle: {width: '14%'}
    },{
                dataField: '_source.attrs.durationMin',
                text: 'DURATION',
                sort: true,
                headerStyle: {width: '14%'}
    }],
    case 'transport': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                 formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.reason',
                text: 'REASON',
                sort: true,
                headerStyle: {width: '10%'}
    }, {
                dataField: '_source.attrs.source',
                text: 'SOURCE',
                sort: true,
                headerStyle: {width: '14%'}
    }],
     case 'network': return [{
                dataField: '_source.@timestamp',
                text: 'TIMESTAMP',
                sort: true,
                headerStyle: {width: '15%'},
                 formatter: (cell, obj) => {
                    var ob = obj._source;
                return  new Date(ob['@timestamp']).toLocaleString();
                }

    }, {
                dataField: '_source.attrs.type',
                text: 'TYPE',
                sort: true,
                headerStyle: {width: '7%'}
    }, {
                dataField: '_source.attrs.hostname',
                text: 'HOSTNAME',
                sort: true,
                headerStyle: {width: '10%'}
    }, {
                dataField: '_source.type_instance',
                text: 'TYPE INSTANCE',
                sort: true,
                headerStyle: {width: '14%'}
    },  {
                dataField: '_source.plugin_instance',
                text: 'PLUGIN INSTANCE',
                sort: true,
                headerStyle: {width: '14%'}
    },
    {
                dataField: '_source.rx',
                text: 'RX',
                sort: true,
                headerStyle: {width: '14%'}
    },{
                dataField: '_source.tx',
                text: 'TX',
                sort: true,
                headerStyle: {width: '14%'}
    },{
                dataField: '_source.value',
                text: 'VALUE',
                sort: true,
                headerStyle: {width: '14%'}
    }]
    }
}
}    
export default TableColumns;