const {
  connectToES
} = require('../modules/elastic');
/*
ES search query

*/
async function searchES(indexName, queries, res) {
  return new Promise(function (resolve, reject) {
    const client = connectToES(res);
    client.search({
      index: indexName,
      type: '_doc',
      body: {
        query: {
          bool: {
            must:
              queries
          }
        }
      }
    }, (error, response) => {
      if (error) {
        console.log(error);
        client.close();
        reject(error);
      } else {
        client.close();
        resolve(response);
      }
    });
  });
}

/*
ES create new index
arg: index name and JSON format of mapping

*/
async function newIndexES(indexName, mapping, res) {
  return new Promise(function (resolve, reject) {
    const client = connectToES(res);
    client.indices.create({
      index: indexName,
      body: {
        mappings: mapping
      }
    }, function (err) {
      if (err) {
        client.close();
        reject(err);
      } else {
        client.close();
        resolve("ok");
      }
    });
  });
}

/*
ES exists index
*/
async function existsIndexES(indexName, res) {
  return new Promise(function (resolve) {
    const client = connectToES(res);
    resolve(client.indices.exists({ index: indexName }));
  });
}

/*
insert new event to index
*/
async function insertES(indexName, event, res) {
  return new Promise(function (resolve, reject) {
    const client = connectToES(res);
    client.index({
      index: indexName,
      refresh: true,
      type: "_doc",
      body: {
        event
      }
    }, function (err) {
      if (err) {
        client.close();
        reject(err);
      } else {
        client.close();
        resolve("ok");
      }
    });
  });
}

/*
ES update query
*/
async function updateES(indexName, queries, script, params, res) {
  console.log("queries");
  console.log(queries);
  return new Promise(function (resolve, reject) {
    const client = connectToES(res);

    console.log("{index: " + indexName + ",type: '_doc', refresh: true, body: {query: { bool: { must:" + JSON.stringify(queries) + "} },'script': { 'source': " + JSON.stringify(script) + ",'lang': 'painless','params': " + JSON.stringify(params) + "}}");

    client.updateByQuery({
      index: indexName,
      scroll: "10s",
      type: '_doc',
      refresh: true,
      conflicts: 'proceed',
      body: {
        query: {
          bool: {
            must: queries
          }
        },
        script: {
          source: script,
          lang: "painless",
          params: params
        }
      }
    }, (error, response) => {
      if (error) {
        console.log(error);
        client.close();
        reject(error);
      } else {
        client.close();
        resolve(response);
      }
    });
  });
}

/*
ES delete  query
*/
async function deleteES(indexName, queries, res) {
  return new Promise(function (resolve, reject) {
    const client = connectToES(res);
    client.deleteByQuery({
      index: indexName,
      type: '_doc',
      refresh: true,
      body: queries
    }, (error, response) => {
      if (error) {
        console.log(error);
        client.close();
        reject(error);
      } else {
        client.close();
        resolve(response);
      }
    });
  });
}

module.exports = {
  searchES: searchES,
  newIndexES: newIndexES,
  existsIndexES: existsIndexES,
  insertES: insertES,
  updateES: updateES,
  deleteES: deleteES
};
