// express.js implement the express conf

const path = require('path');
const express = require('express');
const pretty = require('express-prettify');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { nodeEnv } = require('./config');
const routes = require('../routes');
const middlewares = require('../controller/middlewares');

const app = express();

app.use(cors());
if (nodeEnv !== 'test') app.use(logger('dev'));
app.use(bodyParser.json()); // -> app.use(express.json()); ?
app.use(pretty({ query: 'pretty' }));

// Serve the static files from the React app
// FIXME: path to client
// app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/static', express.static(path.join(process.cwd(), 'report')));

app.use('/api', routes());

//app.use( express.static(path.resolve( __dirname + '/../../report' )));

// load error mdlw at the end
app.use(middlewares.notFound());
app.use(middlewares.handleError());

module.exports = app;
