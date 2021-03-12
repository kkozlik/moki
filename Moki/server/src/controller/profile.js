
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
    //req.body: {userprefs: {list of values}, type: user/domain} 
    ///profile/save
    static storeUserSettings(req, res, next) {
        async function search() {
            var user = AdminController.getUser(req);
            var keys = Object.keys(req.body.userprefs);
            var field = req.body.userprefs[Object.keys(req.body.userprefs)[0]];
            var secret = user["tls-cn"];
            var secretField = "tls-cn";
            if (req.body.type == "domain" && user.jwtbit == 2) {
                secret = user["domain"];
                secretField = "domain";
            }
            //user level 2 wants to change domain settings - refuse
            else if (req.body.type == "domain" && user.jwtbit == 2) {
                return res.status(400).send({
                    "msg": "User can't change domain settings."
                });
            }

            //change format of userprefs before insert into ES
            //"userprefs": {"ddd": "bbb", "aaa": "ccc"}  to ctx._source.event.userprefs.ddd = bbb; ctx._source.event.userprefs.aaa = ccc
            var script = "";
            for (var i = 0; i < keys.length; i++) {
                script = script + " ctx._source.event.userprefs." + keys[i] + "='" + req.body.userprefs[keys[i]] + "';";
            }

            //check if event with same tls-cn/domain exists, if so update it
            var update = await updateES(indexName, [
                { "query_string": { "query": "event." + [secretField] + ":" + secret } }
            ], script, {
                "field": field,
                "key": keys
            }, res);

            //event was updated
            if (update.updated != 0) {
                return res.status(200).send(update);
            }
            //no such event create new one
            else {
                var insert = await insertES(indexName, {
                    [secretField]: secret,
                    "userprefs": req.body.userprefs
                }, res)

                if (insert == "ok") {
                    return res.status(200).send({ insert });
                }
                else {
                    return res.status(400).send({
                        "msg": "Problem with saving profile ." + insert
                    });
                }
            }
        }

        return search().catch((e) => {
            return next(e);
        });
    }

    //get setings from ES
    //users index
    //req.body: attribute 
    // /profile
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
                else {
                    res.status(400).send({
                        "msg": "Problem with getting user profile. " + userProfile
                    })
                    return;
                }
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
