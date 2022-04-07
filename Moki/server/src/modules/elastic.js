// elastic.js hold the ES implem

const { Client } = require('@elastic/elasticsearch')
const { es } = require('./config').cfg;
const { cfg } = require('../modules/config');

module.exports = {
  connectToES: () => {
    let client = {};

    try {
      if (cfg.debug) console.info("Connecting to ES " + es);
      client = new Client({
        node: es,
        requestTimeout: 60000
      });
    } catch (error) {
      console.error('es client error: ', error.msg);
      error.status = 400;
      throw error;
    }
    return client;
  }
};
