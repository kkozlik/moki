
const {
    connectToES
} = require('../modules/elastic');
const {
    searchES,
    newIndexES,
    existsIndexES,
    insertES,
    updateES
} = require('../utils/ES_queries');
const AdminController = require('../controller/admin');
const indexName = "profiles";

class ProfileController {
    //store setings by user in ES
    //users index
    //req.body: {attribute: value, type: user/domain} 
    static storeUserSettings(req, res, next) {
        async function search() {
            var user = AdminController.getUser(req);
            var key = Object.keys(req.body.attribute)[0];
            var field = req.body.attribute[Object.keys(req.body.attribute)[0]];
            var secret = user["tls-cn"];
            var secretField = "tls-cn";
            if (req.body.attribute.type == "domain") {
                secret = user["domain"];
                secretField = "domain";
            }

            //check if event with same tls-cn/domain exists, if so update it
            var update = updateES(indexName, [
                { query_string: { "query": [secret] + ": " + secretField } }
            ], "if(ctx._source.event.userprefs." + key + ") { ctx._source.attrs.userprefs = " + field + ")) }", {
                "attr": field,
                "attr": key
            }, res);

            //event was updated
            if (update == "ok") {
                return res.status(200).send(update);
            }
            //no such event create new one
            else {
                insertES(indexName, {
                    [secretField]: secret,
                    "userprefs": {
                        [key]: field
                    }
                }, res)
            }

            return res.status(400).send({
                "msg": "Problem with saving filter."
            });
        }

        return search().catch((e) => {
            return next(e);
        });
    }

    //get setings from ES
    //users index
    //req.body: attribute 
    static getUserSettings(req, res, next) {
        async function search() {
            var user = AdminController.getUser(req);
            var tls = user["tls-cn"];
            var domain = user["domain"];
            var newIndex = false;

            //check if it is neccesary to create new index
            const existIndex = await existsIndexES(indexName, res);
            //if not, create new one
            if (!existIndex) {
                var response = await newIndexES(indexName, {
                    "properties": {
                        "tls-cn": { "type": "keyword", "index": "true" },
                        "domain": { "type": "keyword", "index": "true" },
                        "profile": { "type": "keyword", "index": "true" },
                        "userprefs": {
                            "properties": {
                                "monitor_name": { "type": "text", "index": "false" },
                                "timezone": { "type": "text", "index": "false" },
                                "time_format": { "type": "text", "index": "false" },
                                "encryption_checksum": { "type": "text", "index": "false" }
                            }
                        }
                    }
                }, res);

                if (response == "ok") {
                    //add new default user profile
                    response = await insertES(indexName, {
                        "tls-cn": "default",
                        "userprefs": {
                            "timezone": "",
                            "time_format": "en-US",
                            "encryption_checksum": ""
                        }
                    }, res);

                    if (response == "ok") {
                        //add new default domain profile
                        response = await insertES(indexName, {
                            "domain": "default",
                            "userprefs": {
                                "monitor_name": "Intuitive labs"
                            }
                        }, res);
                        newIndex = true;
                    }
                    console.info("Created new profile index a inserted default values.")
                }
                else {
                    res.status(400).send({
                        "msg": "Problem with getting user profile. " + response
                    });
                    return;
                }
            }
            if (existIndex || newIndex) {
                //search for user settings
                var userProfile = await searchES(indexName, [{ query_string: { "query": "event.tls-cn:" + tls } }], res);
                //if nothing, search for defaults
                if (userProfile.hits.hits.length == 0) {
                    userProfile = await searchES(indexName, [{ query_string: { "query": "event.tls-cn:default" } }], res);
                }
                else (
                    res.status(400).send({
                        "msg": "Problem with getting user profile. " + userProfile
                    }))
                //domain is undefined for admin
                if (domain != "N/A") {
                    var domainProfile = await searchES(indexName, [{ query_string: { "query": "event.domain:" + domain } }], res);
                }

                //if nothing, return default where domain and tls-cn == "default"
                if (domain == "N/A" || domainProfile.hits.hits.length == 0) {
                    domainProfile = await searchES(indexName, [
                        { query_string: { "query": "event.domain:default" } }
                    ], res);
                }
                res.json(200, [userProfile.hits.hits[0]._source.event, domainProfile.hits.hits[0]._source.event]);
            }
            else {
                res.status(400).send({
                    "msg": "Problem with getting user profile."
                });
            }
        }

        return search().catch((e) => {
            return next(e);
        });
    }
}

module.exports = ProfileController;
