// elastic.js hold the ES implem

const { Client } = require('@elastic/elasticsearch')
const { es } = require('./config').cfg;

module.exports = {
  connectToES: () => {
    let client = {};

    try {
      console.info("Connectiong to ES " + es);
      client = new Client({
        node: es,
        requestTimeout: 60000,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error('es client error: ', error.msg);
      error.status = 400;
      throw error;
    }
    return client;
  }
};
