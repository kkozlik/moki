// setting.js hold the setting endpoints

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
const { getJWTsipUserFilter } = require('../modules/jwt');
const AdminController = require('../controller/admin');
var domainFilter = "*";
var path = require('path');
var monitorVersion = "4.6";
/**
 * @swagger
 * tags:
 *   name: Setting
 *   description: Setting management
 */


/**
 * @swagger
 * definitions:
 *   Settings:
 *     type: "array"
 *     description: JSON settings file contains just global-config optios - general, sns and alarms setting 
 *     example:
 *         [{app: "m_config", attrs: []},{app: "m_alarms", attrs: []},{app: "m_sns",attrs: []}]
 *   SettingFile:
 *     type: "array"
 *     description: JSON settings file contains whole stored settings 
 *     example:
 *         [general: { global-config: [{app: "gconfig", attrs: []}, {app: "m_config",attrs: []}, {app: "m_alarms",attrs: []}, {app: "m_sns",attrs: []}], m_filters: [{id: "filterID",attribute: [ filters: [], name: "dashboard name", types: []]}]}, m_version: "4.5", version: "1.0"]
 */

class SettingController {
    /**
     * @swagger
     * /api/setting:
     *   get:
     *     description: Fetch settings
     *     tags: [Setting]
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Return the json setting - if monitor.json available, value are merged to defaults.json
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/Settings'
     *       400:
     *         description: processing error
     *         content:
     *           application/json:
     *             example: { "error": "Problem reading data file: no such file or directory, open '/etc/abc-monitor/defaults.json'" }
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             example:
     *               error: "bash: not found"
     */
    static load(req, res, next) {
        return fs.readFile(cfg.fileDefaults, (err, defaults) => {
            if (err) {
                console.error(`Problem with reading default file. ${err}`);
                return next(newHTTPError(400, `Problem with reading data: ${err}`));
            }

            return fs.readFile(cfg.fileMonitor, (err2, data) => {
                if (err2) {
                    console.error(`Problem with reading default file. ${err2}`);
                    return next(newHTTPError(400, `Problem with reading data: ${err2}`));
                }

                console.info('Reading files and inserting default values.');
                // if value in monitor.json use this one, not default
                const jsonData = JSON.parse(data);
                const jsonDefaults = JSON.parse(defaults);
                if ('general' in jsonData && jsonData.general['global-config']) {
                    jsonData.general['global-config'].forEach(data => {
                        jsonDefaults.forEach(defaults => {
                            if (data.app == defaults.app) {
                                data.attrs.forEach(attrs => {
                                    defaults.attrs.forEach(defaultsAttrs => {
                                        if (attrs.attribute == defaultsAttrs.attribute) {
                                            defaultsAttrs.value = attrs.value;
                                            if (attrs.comments) {
                                                defaultsAttrs.comments = attrs.comments;
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    });
                }

                return res.status(200).send(jsonDefaults);
            });
        });
    }


    /**
     * @swagger
     * /api/defaults:
     *   get:
     *     description: Return stored defaults values without merging it with user's one
     *     tags: [Setting]
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Setting payload
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/Settings'
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             example:
     *               error: "bash: not found"
     */
    static defaults(request, respond) {
        fs.readFile(cfg.fileDefaults, function (err, defaults) {
            if (err) {
                respond.status(400).send({
                    msg: "Problem with reading data: " + err
                });
                console.error("Problem with reading defaults file. " + err);
            }
            return respond.status(200).send(defaults);

        });
    }

    /**
     * @swagger
     * /api/filters:
     *   get:
     *     description: return stored filter in ES
     *     tags: [Setting]
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Setting payload
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/SettingFile'
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             example:
     *               error: "bash: not found"
     */
    static loadFilters(req, res) {
        //get user's right to load correct filters
        var user = AdminController.getUser(req);
        var condition;
        //admin, show everything
        if (user.jwtbit == 0) {
            condition = {
                index: 'filters',
                type: '_doc'

            };
        }
        //site admin, show only domain
        else if (user.jwtbit == 1) {
            condition = {
                index: 'filters',
                type: '_doc',
                body: {
                    query: {
                        bool: {
                            must: [
                                { query_string: { "query": "domain:"+user.domain } }
                            ],
                        }
                    }
                }
            }

        }
        //user, show domain and user filter
        else {
            condition = {
                index: 'filters',
                type: '_doc',
                body: {
                    query: {
                        bool: {
                            must: [
                                { query_string: { "query": "domain:"+user.domain } },
                                { query_string: { "query": "tls-cn:"+user["tls-cn"] } }
                            ],
                        }
                    }
                }
            }

        }
        var client = connectToES(res);
        console.info("Getting filters for user level: " + user.jwtbit);
        client.search(condition, (error, response, status) => {
            if (error) {
                res.json(400, error);
            }
            else {
                res.json(200, response);
            }
        });
    }

    /**
 * @swagger
 * /api/filters/save:
 *   post:
 *     description: save new filter in ES index
 *     tags: [Setting]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: filter
 *         description: new filter to save
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: {"id":"Myfilter"}
 *             attribute:
 *               type: array
 *               description: array of filters
 *               example: {"attribute":[]}
    *             name:
    *               type: string
    *               description: name of dashboard where filter was created
    *               example: {"name":"/connectivityCA"}
    *             types:
    *               type: array
    *               description: array of types
    *               example: {"types":[]}
    *             timerange:
    *               type: array
    *               description: timestamp from and to
    *               example: {"timerange":[1610683132626,1610683145434]}
 *         required: true
 *         type: application/json 
 *     responses:
 *       200:
 *         description: new settings file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/SettingFile'
 *       400:
 *         description: problem with writing data to file 
 *         content:
 *           application/json:
 *             example:
 *               error: "Config checked failed. Writing old config back."
 */
    static saveFilter(req, res, next) {
        async function search() {
            var client = connectToES(res);
            var user = AdminController.getUser(req);
            var tls = user["tls-cn"];
            var indexName = "filters";

            //check if it is neccesary to create new index
            const existIndex = await client.indices.exists({ index: indexName });
            //if not, create new one
            if (!existIndex) {
                var newIndex = await client.indices.create({
                    index: indexName,
                    body: {
                        mappings: {
                            properties: {
                                "tls-cn": { "type": "keyword", "index": "true" },
                                "domain": { "type": "keyword", "index": "true" },
                                "id": { "type": "keyword", "index": "true" },
                                "title": { "type": "keyword", "index": "false" },
                                "attribute": { "type": "text", "index": "false" }
                            }
                        }
                    }
                }, function (err, resp, respcode) {
                    newIndex = false;
                    console.error(err, resp, respcode);
                });
                newIndex = true;

            }

            if (newIndex || existIndex) {
                //add new event
                var response = await client.index({
                    index: indexName,
                    refresh: true,
                    type: "_doc",
                    body: {
                        "tls-cn": tls,
                        "id": req.body.id,
                        "title": req.body.title,
                        "domain": user.domain,
                        "attribute": JSON.stringify(req.body.attribute)
                    }
                }, function (err, resp, status) {
                    if (err) {
                        console.error(resp);
                    } else {
                        console.info("Inserted new filter: " + tls + ": " + req.body.id);
                    }
                })
                return res.json(response);
            }
            client.close();
            return res.status(400).send({
                "msg": "Problem with saving filter."
            });

        }

        return search().catch((e) => {
            return next(e);
        });

    }

    /**
     * @swagger
     * /api/filters/delete:
     *   get:
     *     description: delete filter
     *     tags: [Setting]
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: filter
     *         description: new filter list
     *         schema:
     *           type: object
     *           properties:
     *             id:
     *               type: string
     *               example: {"id":"Myfilter"}
     *             attribute:
     *               type: array
     *               description: array of filters
     *               example: {"attribute":[]}
        *             name:
        *               type: string
        *               description: name of dashboard where filter was created
        *               example: {"name":"/connectivityCA"}
        *             types:
        *               type: array
        *               description: array of types
        *               example: {"types":[]}
        *             timerange:
        *               type: array
        *               description: timestamp from and to
        *               example: {"timerange":[1610683132626,1610683145434]}
     *         required: true
     *         type: application/json                    
     *     responses:
     *       200:
     *         description: Setting payload
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/SettingFile'
     *       400:
     *         description: Problem writing new filters to config file
     *         content:
     *           application/json:
     *             example:
     *               error: "Problem writing new filters to config file"
     */
    static deleteFilter(req, res) {
        var client = connectToES(res);
        console.info("Deleting filter " + req.body.id);
        client.deleteByQuery({
            index: 'filters',
            type: '_doc',
            refresh: true,
            body: {
                query: {
                    match: { id: req.body.id }
                }
            }
        }, function (error, response) {
            if (error) {
                return res.status(400).send({
                    "msg": "Problem with deleting filter. " + error
                });
            }
            else {
                return res.status(200).send({
                    "msg": "Filter deleted."
                });
            }
        });
    }

    /**
     * @swagger
     * /api/save:
     *   post:
     *     description: save data
     *     tags: [Setting]
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: filter
     *         description: new data to save
     *         schema:
     *           type: object
     *           properties:
     *             id:
     *               type: string
     *               example: {"id":"Myfilter"}
     *             attribute:
     *               type: array
     *               description: array of filters
     *               example: {"attribute":[]}
        *             name:
        *               type: string
        *               description: name of dashboard where filter was created
        *               example: {"name":"/connectivityCA"}
        *             types:
        *               type: array
        *               description: array of types
        *               example: {"types":[]}
        *             timerange:
        *               type: array
        *               description: timestamp from and to
        *               example: {"timerange":[1610683132626,1610683145434]}
     *         required: true
     *         type: application/json 
     *     responses:
     *       200:
     *         description: new settings file
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/definitions/SettingFile'
     *       400:
     *         description: problem with writing data to file 
     *         content:
     *           application/json:
     *             example:
     *               error: "Config checked failed. Writing old config back."
     */
    static save(request, respond) {
        //get config file
        var jsonData = JSON.parse(fs.readFileSync(cfg.fileMonitor));
        var jsonDataOld = JSON.parse(fs.readFileSync(cfg.fileMonitor));

        //if filters paste it on top layer
        if (request.body.app === "m_filters") {
            var filters = [];
            //old
            if (jsonData["general"]["m_filters"]) {
                filters = jsonData["general"]["m_filters"]
            } else {
                jsonData["general"]["m_filters"] = [];
            }

            //add new
            filters.push(request.body.attrs);
            jsonData["general"]["m_filters"] = filters;
            console.info("Writing new filters to file. " + JSON.stringify(filters));


        } else {
            //the rest of m_config
            var isConfigGroupThere = false;
            for (var i = 0; i < jsonData["general"]["global-config"].length; i++) {

                if (jsonData["general"]["global-config"][i]["app"] === request.body.app) {

                    jsonData["general"]["global-config"][i]["attrs"] = request.body.attrs;
                    isConfigGroupThere = true;
                }
            }
            //no m_sns or m_m_config or m_alarms
            if (isConfigGroupThere === false) {
                jsonData["general"]["global-config"].push(request.body);
            }

        }
        //write also monitor version
        jsonData["m_version"] = monitorVersion;

        //write it to monitor file
        fs.writeFile(cfg.fileMonitor, JSON.stringify(jsonData), function (error) {
            if (error) respond.status(400).send({
                "msg": error
            });
            console.info("Writing new config to file. " + JSON.stringify(jsonData));
            //call check config script
            exec("/usr/sbin/abc-monitor-check-config", function (error, stdout, stderr) {
                if (error) {
                    //write old data back
                    fs.writeFile(cfg.fileMonitor, JSON.stringify(jsonDataOld));
                    console.error("Config checked failed. Writing old config back. " + stderr);
                    respond.status(400).send({
                        "msg": stderr
                    });

                } else {
                    console.info("Activating config.");
                    //call generate config script
                    exec("/usr/sbin/abc-monitor-activate-config", function (error, stdout, stderr) {
                        if (error) {
                            respond.status(400).send({
                                "msg": stderr
                            });
                            console.error("Config cannot be activated. " + stderr);
                            respond.end();
                        } else {
                            console.info("New config activated.");
                            respond.status(200).send({
                                "msg": "Data has been saved."
                            });
                        }
                    })

                }
            })


        });
    }

    /**
     * @swagger
     * /api/tag:
     *   get:
     *     description: Add tag to event
     *     tags: [Setting]
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: tag
     *         description: new tag
     *         schema:
     *           type: object
     *           properties:
     *             id:
     *               type: string
     *               example: U9dQO3cBRVjVWRSl0BzX
     *               description: event id
    *             name:
    *               type: string
    *               description: index where event is stored
    *               example: "logstashh-2021.01.25"
    *             types:
    *               type: array
    *               description: array of tags
    *               example: {"tags":["coolEvent"]}
     *         required: true
     *         type: application/json 
     *     responses:
     *       200:
     *         description: Elasticsearch payload
     *         content:
     *           application/json:
     *             example:
     *               {_index: xxx, result: updated}
     *             schema:
     *               $ref: '#/definitions/Message'
     *       500:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             example:
     *               {_index: xxx, result: error}
     */
    static tag(req, res, next) {
        async function search() {
            var tags = req.body.tags;
            var client = connectToES(res);
            const response = await client.update({
                id: req.body.id,
                type: '_doc',
                index: req.body.index,
                refresh: true,
                body: {
                    doc: {
                        attrs: {
                            tags: tags
                        }
                    }
                }
            });

            client.close();
            return res.json(response);
        }

        return search().catch((e) => {
            return next(e);
        });
    }

    /**
     * @swagger
     * /api/tag/delete:
     *   get:
     *     description: delete tag from event
     *     tags: [Setting]
     *     consumes:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: tag
     *         description: tag to delete
     *         schema:
     *           type: object
     *           properties:
     *             id:
     *               type: string
     *               example: U9dQO3cBRVjVWRSl0BzX
     *               description: event id
    *             name:
    *               type: string
    *               description: index where event is stored
    *               example: "logstashh-2021.01.25"
    *             types:
    *               type: array
    *               description: array of tags
    *               example: {"tags":["coolEvent"]}
     *         required: true
     *         type: application/json 
     *     responses:
     *       200:
     *         description: Elasticsearch payload
     *         content:
     *           application/json:
     *             example:
     *               {_index: xxx, result: updated}
     *             schema:
     *               $ref: '#/definitions/Message'
     *       500:
     *         description: elasticsearch error
     *         content:
     *           application/json:
     *             example:
     *               {_index: xxx, result: error}
     */
    static deleteTag(req, res, next) {
        async function search() {
            var tag = req.body.tags;
            var client = connectToES(res);
            const response = await client.updateByQuery({
                index: "*",
                refresh: true,
                body: {
                    "query": {
                        "match": {
                            "attrs.tags": tag
                        }
                    },
                    "script": {
                        "source": "if(ctx._source.attrs.tags.contains(params.tag)) { ctx._source.attrs.tags.remove(ctx._source.attrs.tags.indexOf(params.tag)) }",
                        "lang": "painless",
                        "params": {
                            "tag": tag
                        }
                    }
                }
            });

            client.close();
            return res.json(response);
        }

        return search().catch((e) => {
            return next(e);
        });
    }


    /**
     * /api/tags:
**/
    static tags(req, res, next) {
        async function search() {
            const client = connectToES(res);
            const tags = distinct_query.getTemplate('attrs.tags');

            const response = await client.msearch({
                body: [

                    {
                        index: 'logstash*',
                        ignore_unavailable: true,
                        preference: 1542895076143,
                    },
                    tags
                ]
            });

            client.close();
            return res.json(response);
        }

        return search().catch((e) => {
            return next(e);
        });
    }

    /**
     * @swagger
     * /api/monitor/version:
     *   get:
     *     description: Return the monitor version
     *     tags: [Setting]
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Setting payload
     *         content:
     *           application/json:
     *             example:
     *               version: 4.5
     *       500:
     *         description: internal error
     *         content:
     *           application/json:
     *             example:
     *               error: "bash: not found"
     */
    static loadMonitorVersion(request, respond) {
        return exec(" rpm -q --qf '%{VERSION}-%{RELEASE}\n'  abc-monitor", (error, stdout, stderr) => {
            if (!error) {
                setMonitorVersion(stdout);
            }
            monitorVersion = cfg.monitorVersion;
            return respond.status(200).send({
                version: cfg.monitorVersion
            });
        });
    }

    //api/monitor/logo
    static loadLogo(request, respond) {
        var logoPath = "../../../" + request.body.path;
        var img = fs.readFileSync(path.join(__dirname, logoPath));
        respond.writeHead(200, { 'Content-Type': 'image/png' });
        respond.end(img, 'binary');
    }

    // get hostnames
    static hostnames(req, res, next) {
        async function search() {
            const client = connectToES(res);

            //check if domain fiter should be use
            var isDomainFilter = await getJWTsipUserFilter(req);
            if (isDomainFilter.domain) {
                domainFilter = "tls-cn:" + isDomainFilter.domain;
            }

            // get hostnames list
            const hostnames = distinct_query.getTemplate('attrs.hostname', domainFilter);
            // get realms list
            const realms = distinct_query.getTemplate('attrs.realm', domainFilter);
            const srcRealms = distinct_query.getTemplate('attrs.src_rlm_name', domainFilter);
            const dstRealms = distinct_query.getTemplate('attrs.dst_rlm_name', domainFilter);
            const tags = distinct_query.getTemplate('attrs.tags', domainFilter);

            const response = await client.msearch({
                body: [
                    {
                        index: 'logstash*',
                        ignore_unavailable: true,
                        preference: 1542895076143,
                    },
                    hostnames,
                    {
                        index: 'collectd*',
                        ignore_unavailable: true,
                        preference: 1542895076143,
                    },
                    realms,
                    {
                        index: 'logstash*',
                        ignore_unavailable: true,
                        preference: 1542895076143,
                    },
                    srcRealms,
                    {
                        index: 'logstash*',
                        ignore_unavailable: true,
                        preference: 1542895076143,
                    },
                    dstRealms,
                    {
                        index: 'logstash*',
                        ignore_unavailable: true,
                        preference: 1542895076143,
                    },
                    tags,
                ]
            });

            client.close();
            return res.json(response);
        }

        return search().catch((e) => {
            return next(e);
        });
    }
}

module.exports = SettingController;
