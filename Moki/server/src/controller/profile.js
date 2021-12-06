
const {
  searchES,
  newIndexES,
  existsIndexES,
  insertES,
  updateES,
  deleteES
} = require('../utils/ES_queries');
const moment = require('moment-timezone');
const AdminController = require('./admin');
const { getDefaults } = require('../modules/config');
const indexName = "profiles";

class ProfileController {
  //store setings by user in ES
  //users index
  //req.body: {userprefs: {list of values}, type: user/domain} 
  ///profile/save
  static storeUserSettings(req, res, next) {
    async function search() {
      const user = AdminController.getUser(req);
      let keys = Object.keys(req.body.userprefs);
      const field = req.body.userprefs[Object.keys(req.body.userprefs)[0]];
      let secret = user["tls-cn"];
      let secretField = "tls-cn";

      if (req.body.type === "domain" && user.jwtbit !== 2) {
        secret = user["domain"];
        secretField = "domain";
      }
      //user level 2 wants to change domain settings - refuse
      else if (req.body.type === "domain" && user.jwtbit === 2) {
        return res.status(400).send({
          "msg": "User can't change domain settings."
        });
      }

      //change format of userprefs before insert into ES
      //"userprefs": {"ddd": "bbb", "aaa": "ccc"}  to ctx._source.event.userprefs.ddd = bbb; ctx._source.event.userprefs.aaa = ccc
      let script = "";
      for (let i = 0; i < keys.length; i++) {
        //check if object type, parse it 
        if (typeof req.body.userprefs[keys[i]] === 'object') {
          let innerKeys = Object.keys(req.body.userprefs[keys[i]]);
          for (let j = 0; j < innerKeys.length; j++) {
            script = script + " ctx._source.event.userprefs." + keys[i] + "['" + innerKeys[j] + "']='" + req.body.userprefs[keys[i]][innerKeys[j]] + "';";
          }
        }
        else {
          script = script + " ctx._source.event.userprefs." + keys[i] + "='" + req.body.userprefs[keys[i]] + "';";
        }
      }

      // keys.splice(keys.indexOf("anonymizableAttrs"), 1);
      //check if event with same tls-cn/domain exists, if so update it
      const update = await updateES(indexName, [
        { "query_string": { "query": "event." + [secretField] + ":" + secret } }
      ], script, {
        "field": field,
        "key": keys
      }, res);

      //event was updated
      if (update.updated !== 0) {
        return res.status(200).send(update);
      }
      //no such event create new one
      else {
        const insert = await insertES(indexName, {
          [secretField]: secret,
          "userprefs": req.body.userprefs
        }, res);

        if (insert === "ok") {
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

  //delete 
  //users index
  ///profile/delete
  static deleteUserSettings(req, res, next) {
    async function search() {
      const user = AdminController.getUser(req);
      const secret = user["tls-cn"];
      const deleted = await deleteES(indexName, { "query": { "match": { "event.tls-cn": secret } } }, res);
      if (deleted !== 0) {
        return res.status(200).send(deleted);
      }
      else {
        return res.status(400).send({
          "msg": "Problem with deleting profile ." + deleted
        });
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
      const user = AdminController.getUser(req);
      const tls = user["tls-cn"];
      const domain = user["domain"];
      let newIndex = false;
      let jsonDefaults = await getDefaults();
      //check if it is neccesary to create new index
      const existIndex = await existsIndexES(indexName, res);
      //if not, create new one
      if (!existIndex) {
        //mode: encrypt, plain, anonymous
        let response = await newIndexES(indexName, {
          "properties": {
            "event": {
              "properties": {
                "tls-cn": { "type": "keyword", "index": "true" },
                "domain": { "type": "keyword", "index": "true" },
                "profile": { "type": "keyword", "index": "true" },
                "userprefs": {
                  "properties": {
                    "monitor_name": { "type": "text", "index": "false" },
                    "timezone": { "type": "text", "index": "false" },
                    "time_format": { "type": "text", "index": "false" },
                    "date_format": { "type": "text", "index": "false" },
                    "mode": { "type": "text", "index": "false" },
                    "validation_code": { "type": "text", "index": "false" },
                    "anonymizableAttrs": { "type": "flattened" }
                  }
                }
              }
            }
          }
        }, res);

        if (response !== "ok") {
          res.status(400).send({
            "msg": "Problem with creating profile index. " + JSON.stringify(response)
          });
          return;
        }
        else {
          newIndex = true;
        }
      }
      if (existIndex || newIndex) {
        //search for user settings
        let userProfile = await searchES(indexName, [{ query_string: { "query": "event.tls-cn:" + tls } }], res);

        //default user profile
        //get timezone from server
        var tz = new Date().getTimezoneOffset() === 0 ? "Etc/GMT+" + new Date().getTimezoneOffset() : "Etc/GMT" + new Date().getTimezoneOffset();

        //get user defaults config
        jsonDefaults.userprefs.timezone = tz;

        let userProfileDefault = {
          "tls-cn": "default",
          "userprefs": jsonDefaults.userprefs
        };


        //no user profile, use default
        if (userProfile.hits.hits.length === 0) {
          userProfile = userProfileDefault;
        }
        //check if all parameters in default profile are also in user profile
        else {
          userProfile = userProfile.hits.hits[0]._source.event;
          let keys = Object.keys(userProfileDefault.userprefs);
          for (let i = 0; i < keys.length; i++) {
            //check if object type, parse it 
            if (typeof userProfileDefault.userprefs[keys[i]] === 'object') {
              let innerKeys =Object.keys(userProfileDefault.userprefs[keys[i]]);
              for (let j = 0; j < innerKeys.length; j++) {
                if (!userProfile.userprefs[keys[i]][innerKeys[j]]) {
                  userProfile.userprefs[keys[i]][innerKeys[j]] = userProfileDefault.userprefs[keys[i]][innerKeys[j]];
                }
              }
            }
            else {
              if (!userProfile.userprefs[keys[i]]) {
                userProfile.userprefs[keys[i]] = userProfileDefault.userprefs[keys[i]];
              }
            }
          }
        }

        let domainProfile;
        //domain is undefined for admin
        if (domain !== "N/A") {
          domainProfile = await searchES(indexName, [{ query_string: { "query": "event.domain:" + domain } }], res);
        }

        let defaultDomainProfile = {
          "domain": "default",
          "userprefs": jsonDefaults.domainprefs
        }

        //if nothing, return default where domain and tls-cn == "default"
        if (domain === "N/A" || domainProfile.hits.hits.length === 0) {
          domainProfile = defaultDomainProfile;
        } //check if all parameters in default profile are also in user profile
        else {
          domainProfile = domainProfile.hits.hits[0]._source.event;
          keys = Object.keys(defaultDomainProfile.userprefs);
          for (i = 0; i < keys.length; i++) {
            if (!domainProfile.userprefs[keys[i]]) {
              domainProfile.userprefs[keys[i]] = defaultDomainProfile.userprefs[keys[i]];
            }
          }
        }

        res.json(200, [userProfile, domainProfile]);
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
