// middlewares.js hold some useful middlware to force json error

const nodeEnv = require('../modules/config');

// return a 404 error not found
function notFound(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
}

// handleError to generate JSON from obj
// eslint-disable-next-line no-unused-vars
function handleError(err, req, res, next) {
  const val = err.status || 500;
  let ret = { error: err.message, trace: err.statck };

  if (nodeEnv === 'production') {
    ret = { error: err.message };
  }

  if (val !== 404) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }

  res.status(val);
  res.json(ret);
}

module.exports = {
  handleError: () => handleError,
  notFound: () => notFound,
};
