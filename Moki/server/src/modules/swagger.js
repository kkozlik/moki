const swaggerJSDoc = require('swagger-jsdoc');

// swagger doc
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Moki express API',
      description: 'Monitor server API. Most of the requests are for getting data to dashboards or time series data for charts animations.',
      version: '1.1.0',
      contact: {
        name: 'Jana Němcová',
        email: 'jana.nemcova@frafos.com'
      }
    },
    servers: [{
      url: 'http://localhost:3000/'
    }]
  },
  apis: [
    './src/controller/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = specs;
