var system = require('system');
var page = require('webpage').create();
page.paperSize = {
   width: '1200px',
   height: '1200px',
 //  margin: '1cm'
}

page.viewportSize = {
  width: 1200,
  height: 1200
    };
 
var webserver = require('webserver');
var server = webserver.create();
webserver.port = 8888;


if(system.args[1] == "24h"){
	var now = new Date().toISOString();
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday = yesterday.toISOString();
page.open("http://127.0.0.1:5601/app/kibana#/dashboard/Home?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:'"+yesterday+"',mode:absolute,to:'"+now+"'))",  function () {
    window.setTimeout(function () {
                page.render('/opt/abc-monitor-gui/report.pdf');
                phantom.exit();
    }, 100000);

});
}
else if (system.args[1] == "7d"){
	var now = new Date().toISOString();
	var weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);
	weekAgo = weekAgo.toISOString();
page.open("http://127.0.0.1:5601/app/kibana#/dashboard/Home?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:'"+weekAgo+"',mode:absolute,to:'"+now+"'))",  function () {
    window.setTimeout(function () {
                page.render('/opt/abc-monitor-gui/report.pdf');
                phantom.exit();
    }, 100000);
});
}
