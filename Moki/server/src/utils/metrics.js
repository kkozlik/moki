// metrics.js hold some metric logic
const fs = require('fs');
const { cfg } = require('../modules/config');

function getFiltersConcat(filters) {
  // get filters, if no place "*", if more than 1, concat with AND
  let filter = '*';
  if (filters && filters.length != 0) {
    for (var i = 0; i < filters.length; i++) {
      if (i == 0) {
        if (filters[i].title.includes("\\")) {
          filter = filters[i].title.replace("\\", String.fromCharCode(92));
        } else {
          filter = filters[i].title;
        }
      } else {
        filter = `${filter}  AND ${filters[i].title}`;
      }
    }
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
            result = "attrs.type:" + filtredTypes[i];
          }
          else {
            result = result + " OR attrs.type:" + filtredTypes[i]
          }
        }
        resolve(result)
      }
    })
  })
}

function getTypesConcat(value) {
  console.info(value);
  // concat types with OR
  var types = '*';
  if (value && value.length != 0) {
    for (var i = 0; i < value.length; i++) {
      if (i == 0) {
        types = "attrs.type:" + value[i].id;
      } else {
        types = types + " OR attrs.type:" + value[i].id;
      }
    }
  }
  return types;
}

function getQueries(filter, types, timestamp_gte, timestamp_lte, userFilter, chartFilter, domain, isEncryptChecksumFilter) {

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

  if (filter !== '*') {

    queries.push({
      "query_string": {
        "query": filter,
        "analyze_wildcard": true,
        "fuzzy_max_expansions": 0,
        "fuzziness": 0
      }
    });
  }

  if (types !== "*") {
    queries.push({
      "query_string": {
        "query": types
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
