// elastic.js hold the ES implem

const { Client } = require('@elastic/elasticsearch')
const { es } = require('./config').cfg;

module.exports = {
  connectToES: () => {
    let client = {};

    try {
      console.info("Connecting to ES " + es);
      client = new Client({
        node: es,
        //requestTimeout: 60000
        requestTimeout: 5000
      });
    } catch (error) {
      console.error('es client error: ', error.msg);
      error.status = 400;
      throw error;
    }
    return client;
  }
};
