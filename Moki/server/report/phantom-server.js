/*
chromium and puppeteer is used to render pdf reports

- it expect time (24h, 7d) as an argument when call, e.g. "node phantom-server.js 24h" without argument it renders last 6 hours
*/

const puppeteer = require('puppeteer');
var url = "http://127.0.0.1:5000/static/report.html";
const time = process.argv[2];

if (time == "24h") {
    //var now = new Date().toISOString();
    var now = Math.round(new Date());
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = Math.round(yesterday);
    url = "http://127.0.0.1:5000/static/report.html?gte=" + yesterday + "&lte=" + now;
} else if (time == "7d") {
    var now = new Date().toISOString();
    var weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo = weekAgo.toISOString();
    url = "http://127.0.0.1:5000/static/report.html?gte=" + weekAgo + "&lte=" + now;
}

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    })
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'networkidle0'
    });
    await page.pdf({
        path: 'report.pdf',
        format: 'A4',
        margin: {
            top: '0px',
            bottom: '0px',
            right: '20px'
        }
    });
    browser.close();
}
run();
