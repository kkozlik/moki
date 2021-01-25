const sendmail = require('sendmail')();
const args = process.argv;

var fs = require('fs');
var email = "";
var emailFrom = "";

fs.readFile('/var/lib/logstash/logstash-thresholds.json', 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
	 var obj = JSON.parse(data);

	 for (var key in obj) {
		if(key == "email_reports"){
			email = obj[key];	
		}
        if(key == "bl_email_from"){
			emailFrom = obj[key];	
		}
	}
    
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var d = new Date();
var month = monthNames[d.getMonth()];
	
	sendmail({
		from: emailFrom,
		to: email,
		subject: "Monitor "+args[3]+" report "+month+" "+d.getDate()+" "+d.getFullYear(),
		html: '<p>Hello, </p><p>here is your morning '+args[3]+' report from machine '+args[2]+'.</p></b></br><p>Have a nice day, Frafos team</p>',
		 attachments: [
		{   // utf-8 string as an attachment
			filename: "report "+month+" "+d.getDate()+" "+d.getFullYear()+".pdf",
			//filename: "report.pdf",
			path: '/opt/abc-monitor-gui/report.pdf'
		}]
	  }, function(err, reply) {
		console.log(err && err.stack);
		console.dir(reply);
	});
	
});


