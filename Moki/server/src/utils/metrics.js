// metrics.js hold some metric logic

const { getTimestampBucket } = require('./ts');
var fs = require("fs"),
  json;


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

function getTypesConcat(value) {
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

function getQueries(filter, types, timestamp_gte, timestamp_lte, userFilter, chartFilter, domain) {
  const timebucket = getTimestampBucket(timestamp_gte, timestamp_lte);
  var queries = [];

  if (domain !== "*") {
    queries.push({
      "match": {
        "tls-cn":  domain
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

  if (userFilter.userFilter && userFilter.userFilter !== "*") {
    queries.push({
      "query_string": {
        "query": userFilter.userFilter
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
  getQueries: getQueries
};
