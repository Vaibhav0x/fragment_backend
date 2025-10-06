const logger = require('../logger');

module.exports = (err, req, res) => {
  logger.error({ err }, 'Unhandled Error');
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
};
