// server.js hold the main process for the server part

// TODO: rename to app.js (this isn't a server isn't ;) )

const app = require('./modules/express');
const { cfg } = require('./modules/config');


// const port = process.env.PORT || 5000;
// start server
let server = app.listen(cfg.port, cfg.addr);

// eslint-disable-next-line no-console
server.on('listening', () => {
  console.log(`listening on:\t ${cfg.addr}:${cfg.port}`);
}).on('error', console.log);

module.exports = app;

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  })
})
