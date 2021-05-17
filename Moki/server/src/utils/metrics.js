// metrics.js hold some metric logic
const fs = require('fs');
const { cfg } = require('../modules/config');

function getFiltersConcat(filters) {
  // get filters, if no place "*", if more than 1, concat with AND
  let filter = '*';
  if (filters && filters.length != 0) {
    var filtersList = [];
    for (var i = 0; i < filters.length; i++) {
      var tit = filters[i].title;
      //replace double shash with ASCII - ES had a problem to parse it
      if (tit.includes("\\")) {
        tit = tit.replace("\\", String.fromCharCode(92))
      }

      //wildcard search - special ES query
      if ((tit.includes("*") || tit.includes("?")) && !tit.includes("/")) {
        //is field name?
        if (tit.includes(":")) {
          filtersList.push({
            "wildcard": {
              [tit.substring(0, tit.indexOf(":"))]: tit.substring(tit.indexOf(":") + 1)
            }
          })
        }
        else {
          filtersList.push({
            "wildcard": {
              "attrs.all_copy": tit
            }
          })
        }
      }
      else {
        filtersList.push({
          "query_string": {
            "query": tit
          }
        })
      }
    }
    return filtersList;
  }
  return filter;
}

//get type list from monitor_layout and check if all should be displayed
async function checkSelectedTypes(types, dashboardName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(cfg.fileGUILayout, (err, layout) => {
      if (err) {
        console.error(`Problem with reading default file. ${err}`);
        reject(newHTTPError(400, `Problem with reading data: ${err}`));
      }
      const jsonLayout = JSON.parse(layout);
      var selectedTypes = jsonLayout.types[dashboardName];
      var field = dashboardName == "exceeded" ? "exceeded" : "attrs.type";
      //filter out not selected types
      var filtredTypes = types.filter(item => selectedTypes.includes(item));
      //if no spec types, return selected types from file
      if (types.length == 0) { filtredTypes = selectedTypes }
      //concat types with OR
      if (filtredTypes.length == 0) { resolve("noTypes") }
      else {
        var result = "";
        for (var i = 0; i < filtredTypes.length; i++) {
          if (i == 0) {
            result = field + ":" + filtredTypes[i];
          }
          else {
            result = result + " OR " + field + ":" + filtredTypes[i]
          }
        }
        resolve(result)
      }
    })
  })
}

//concat all enable types (if exceeded use field exceeded, otherwise attrs.type)
function getTypesConcat(value, type = "attrs.type") {
  console.info(value);
  // concat types with OR
  var types = '*';
  if (value && value.length != 0) {
    for (var i = 0; i < value.length; i++) {
      if (i == 0) {
        types = type + ":" + value[i].id;
      } else {
        types = types + " OR " + type + ":" + value[i].id;
      }
    }
  }
  return types;
}

function getQueries(filter, types, timestamp_gte, timestamp_lte, userFilter, chartFilter, domain, isEncryptChecksumFilter, exists) {

  var queries = [];
  if (isEncryptChecksumFilter !== "*") {
    queries.push({
      "match": {
        "encrypt": isEncryptChecksumFilter
      }
    });
  }

  if (domain !== "*") {
    queries.push({
      "match": {
        "tls-cn": domain
      }
    });
  }

  //add user filters 
  if (filter !== '*') {
    for (var i = 0; i < filter.length; i++) {
      queries.push(filter[i]);
    }
  }

  if (types !== "*") {
    queries.push({
      "query_string": {
        "query": types
      }
    });
  }

  //exists attribute condition
  if (exists) {
    queries.push({
      "exists": {
        "field": exists
      }
    });
  }


  queries.push({
    "range": {
      "@timestamp": {
        "gte": timestamp_gte,
        "lte": timestamp_lte,
        "format": "epoch_millis"
      }
    }
  });

  if (userFilter && userFilter !== "*") {
    queries.push({
      "query_string": {
        "query": userFilter
      }
    });
  }

  if (chartFilter !== "*") {
    queries.push({
      "query_string": {
        "query": chartFilter
      }
    });
  }

  return queries;
}


module.exports = {
  getFiltersConcat: getFiltersConcat,
  getTypesConcat: getTypesConcat,
  getQueries: getQueries,
  checkSelectedTypes: checkSelectedTypes
};
