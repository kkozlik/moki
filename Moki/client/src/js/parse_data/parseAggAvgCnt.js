/*
return avg_count of the aggregations
*/

function parse(response) {
  if (response &&
          response.aggregations &&
          response.aggregations["avg_count"] &&
          response.aggregations["avg_count"].value) {
    return responses.aggregations["avg_count"].value;
  }
  return 0;
}

module.exports = {
    parse: parse
};
