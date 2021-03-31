// diagram.js hold the setting endpoints

const fs = require('fs');
const {
    exec
} = require('child_process');
const {
    newHTTPError
} = require('./index');
const {
    cfg,
    setMonitorVersion
} = require('../modules/config');
const {
    connectToES
} = require('../modules/elastic');
const distinct_query = require('../../js/template_queries/distinct_query.js');
const ejs = require('ejs');
const path = require('path');
var monitorVersion = "4.5";

/**
 * @swagger
 * tags:
 *   name: Diagram
 *   description: Diagram and PCAP management
 */


class DiagramController {

    /**
     * @swagger
     * /api/download/pcap:
     *   get:
     *     description: Return stored pcap file 
     *     tags: [Diagram]
     *     produces:
     *       - application
     *     parameters:
     *         description: pcap file
     *     responses:
     *       200:
     *         description: pcap file
     *         content:
     *           application:
     *             example:
     *               {pcap}
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/Error'
     *             example:
     *               error: "bash: not found"
     */
    static downloadPcap(request, respond) {
        if (request.body.url == null) {
            return respond.status(400).send({Error: "Error: no pcap file"});
        } else {
            var file = "/data/sbcsync/traffic_log/" + request.body.url;

            //check if file exists
            fs.access(file, err => {
                if (err) {
                    console.error(err);
                    return respond.status(400).send({
                        err
                    });
                } else {
                    respond.writeHead(200, {
                        "Content-Type": "application/octet-stream",
                        "Content-Disposition": "attachment; filename=" + file
                    });
                    return fs.createReadStream(file).pipe(respond);

                }
            })
        }
    }

    /**
     * @swagger
     * /api/download/merged:
     *   get:
     *     description: Return merged pcap files 
     *     tags: [Diagram]
     *     produces:
     *       - application
     *     parameters:
     *         description: pcap file
     *     responses:
     *       200:
     *         description: pcap file
     *         content:
     *           application:
     *             example:
     *               {pcap}
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/Error'
     *             example:
     *               error: "bash: not found"
     */
    static downloadMergePcap(request, respond) {
        var file = request.body.url;
        var error = false;
        //check if all files exists
        for (var i = 0; i < file.length; i++) {
            fs.access(file[i], fs.F_OK, (err) => {
                if (err) {
                    console.error(err);
                    respond.status(400).send({
                        err
                    });
                    i = file.length;
                    error = true;
                    respond.end();
                }

            })
            if (error) {
                break;
            }
        }
        if (!error) {
            //mergecap -w result.pcap file1.pcap file2.pcap…. fileX.pcap
            file = file.join(' ');
            var process = ["mergecap -w /data/sbcsync/traffic_log/result.pcap ", file].join(' ');
            var result = exec(process, function (error, stdout, stderr) {
                if (error) {
                    console.error("Problem with receiving file. " + error);
                    respond.status(400).send({
                        "Error": "Problem with receiving file."
                    });
                    respond.end();
                } else {
                    var fileResult = "/data/sbcsync/traffic_log/result.pcap";
                    respond.writeHead(200, {
                        "Content-Type": "application/octet-stream",
                        "Content-Disposition": "attachment; filename=" + fileResult
                    });
                    fs.createReadStream(fileResult).pipe(respond);
                }
            })
        }

    }

    /**
     * @swagger
     * /api/diagram:
     *   get:
     *     description: return xml pcap file to render sequence diagram 
     *     tags: [Diagram]
     *     produces:
     *       - application/xml
     *     parameters:
     *         description: xml file
     *     responses:
     *       200:
     *         description: xml file
     *         content:
     *           application:
     *             example:
     *               {xml}
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/Error'
     *             example:
     *               error: "bash: not found"
     */
    static sequenceDiagram(request, respond) {
        var file = request.body.url;
        var error = false;
        //merge multi file
        if (Array.isArray(file)) {
            var concatFile = "";
            //check if all files exists
            for (var i = 0; i < file.length; i++) {
                //change file format -r source1 -r source2
                concatFile = concatFile + " -r " + file[i];
                fs.access(file[i], fs.F_OK, (err) => {
                    if (err) {

                        console.error(err);
                        respond.status(400).send({
                            err
                        });
                        i = file.length;
                        error = true;
                        respond.end();
                    }

                })
                if (error) {
                    break;
                }
            }
            if (!error) {
                var process = ["cfanal -time-sort-destinations -ignore-ser-dns-wd -ignore-dns-ptr -sip-timestamp -sip-message-details -silent -print-cf - ", concatFile].join(' ');

                var result = exec(process, function (error, stdout, stderr) {
                    if (error) {
                        console.error("Problem with receiving file. " + error);
                        respond.status(400).send({
                            "Error": "Problem with receiving file."
                        });
                        respond.end();

                    } else {
                        console.info("XML file from cfanal received.");
                        respond.status(200).write(stdout);
                        respond.end();
                    }
                })
            }
        } else {
            //check if file exists
            fs.access(file, fs.F_OK, (err) => {
                if (err) {
                    console.error(err);
                    respond.status(400).send({
                        "Error": "File doesn't exist."
                    });
                    respond.end();

                } else {

                    var process = ["cfanal -time-sort-destinations -ignore-ser-dns-wd -ignore-dns-ptr -sip-timestamp -sip-message-details -silent -print-cf - -r ", file].join(' ');

                    var result = exec(process, function (error, stdout, stderr) {
                        if (error) {
                            console.error("Problem with receiving file. " + error);
                            respond.status(400).send({
                                "Error": "Problem with receiving file."
                            });
                            respond.end();
                        } else {
                            console.info("XML file from cfanal received.");
                            respond.status(200).write(stdout);
                            respond.end();
                        }
                    })
                }
            })
        }
    }

    /**
     * @swagger
     * /api/download/diagram:
     *   get:
     *     description: return html file with inserted xml to render whole diagram without needed external xml file 
     *     tags: [Diagram]
     *     produces:
     *       - application/html
     *     parameters:
     *         description: html file
     *     responses:
     *       200:
     *         description: html file
     *         content:
     *           application:
     *             example:
     *               {html}
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/Error'
     *             example:
     *               error: "bash: not found"
     */
    static sequenceDiagramDownload(request, respond) {
        var file = request.body.url;
        var process = "";
        //merge pcap
        if (file.length > 1) {
            var concatFile = "";
            //check if all files exists
            for (var i = 0; i < file.length; i++) {
                //change file format -r source1 -r source2
                concatFile = concatFile + " -r " + file[i];
                fs.access(file[i], fs.F_OK, (err) => {
                    if (err) {

                        console.error(err);
                        respond.status(400).send({
                            err
                        });
                        i = file.length;
                        respond.end();
                    }

                })
            }
            var process = ["cfanal -time-sort-destinations -ignore-ser-dns-wd -ignore-dns-ptr -sip-timestamp -sip-message-details -silent -print-cf - ", concatFile].join(' ');

            var result = exec(process, function (error, stdout, stderr) {
                //replace breaks
                stdout = stdout.replace(/(\r\n|\n|\r)/gm, "");
                //replace double quotes with single ones
                stdout = stdout.replace('"', '\'');
                //get template and insert xml value
                ejs.renderFile(path.resolve("./src/modules/sd.ejs"), {
                    xml: stdout
                }, (err, str) => {
                    // str => Rendered HTML string
                    if (err) {
                        console.log(err)
                    } else {
                        respond.status(200).write(str);
                        respond.end();
                    }
                })

            })
        }
        //only one pcap
        else {
            if (file[0] == null) {
                respond.status(400).write("Error: no pcap file to render");
                respond.end();
            }
            else {
                file = '/data/sbcsync/traffic_log/' + file[0];
                //check if file exists
                fs.access(file, fs.F_OK, (err) => {
                    if (err) {
                        console.error(err);
                        respond.status(400).send({
                            "Error": "File doesn't exist."
                        });
                        respond.end();

                    }
                    process = ["cfanal -time-sort-destinations -ignore-ser-dns-wd -ignore-dns-ptr -sip-timestamp -sip-message-details -silent -print-cf - -r ", file].join(' ');


                    var result = exec(process, function (error, stdout, stderr) {
                        if (error) {
                            console.error("Problem with receiving file. " + error);
                            respond.status(400).send({
                                "Error": "Problem with receiving file."
                            });
                            respond.end();
                        } else {
                            console.info("XML file from cfanal received.");

                            //replace breaks
                            stdout = stdout.replace(/(\r\n|\n|\r)/gm, "");
                            //replace double quotes with single ones
                            stdout = stdout.replace('"', '\'');

                            //get template and insert xml value
                            ejs.renderFile(path.resolve("./src/modules/sd.ejs"), {
                                xml: stdout
                            }, (err, str) => {
                                // str => Rendered HTML string
                                if (err) {
                                    console.log(err)
                                } else {
                                    respond.status(200).write(str);
                                    respond.end();
                                }
                            })

                        }
                    })

                })
            }
        }

    }
}

module.exports = DiagramController;
