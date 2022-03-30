const {
  connectToES
} = require('../modules/elastic');
const { cfg } = require('../modules/config');
/*
ES search query

*/
async function searchES(indexName, queries, res) {
  const client = connectToES();
  if (cfg.debug) console.info("Search in ES " + JSON.stringify(queries));
  return await client.search({
    index: indexName,
    body: {
      query: {
        bool: {
          must:
            queries
        }
      }
    }
  })
}

/*
ES create new index
arg: index name and JSON format of mapping

*/
async function newIndexES(indexName, mapping, res) {
  const client = connectToES();
  if (cfg.debug) console.info("Creating new index " + indexName + " " + JSON.stringify(mapping));
  return await client.indices.create({
    index: indexName,
    body: {
      mappings: mapping
    }
  })
}

/*
ES exists index
*/
async function existsIndexES(indexName, res) {
  const client = connectToES();
  return await client.indices.exists({ index: indexName });
}

/*
insert new event to index
*/
async function insertES(indexName, event, res) {
  const client = connectToES();
  if (cfg.debug) console.info("Inserting " + indexName + " " + JSON.stringify(event));
  return client.index({
    index: indexName,
    refresh: true,
    body: {
      event
    }
  })
}

/*
ES update query
*/
async function updateES(indexName, queries, script, params, res) {
  if (cfg.debug) console.info("Updating " + indexName + " " + JSON.stringify("{index: " + indexName + ",type: '_doc', refresh: true, body: {query: { bool: { must:" + JSON.stringify(queries) + "} },'script': { 'source': " + JSON.stringify(script) + ",'lang': 'painless','params': " + JSON.stringify(params) + "}}"));
  const client = connectToES();
  return await client.updateByQuery({
    index: indexName,
    refresh: true,
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
  })
}

/*
ES delete  query
*/
async function deleteES(indexName, queries, res) {
  const client = connectToES();
  if (cfg.debug) console.info("deleting from index " + indexName + " " + JSON.stringify(queries));
  return await client.deleteByQuery({
    index: indexName,
    refresh: true,
    body: queries
  })
}

module.exports = {
  searchES: searchES,
  newIndexES: newIndexES,
  existsIndexES: existsIndexES,
  insertES: insertES,
  updateES: updateES,
  deleteES: deleteES
};
