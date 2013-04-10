var
  events = require('events'),
  sys = require('sys'),
  config = require('../package.json')
;

function ChromeLogger(res, data, type) {
  events.EventEmitter.call(this);
  var logger = this;

  function encode(data) {
    try {
      data = JSON.stringify(data);
    } catch (err) {
      logger.emit('error', err);
      data = ''; // Should log the error client-side
    }
    data = new Buffer(data, 'binary').toString('base64');
    return data;
  }

  function log(res, type, data) {
    if (res.headersSent) {
      logger.emit('error', '[Error: You can\'t log with Chrome Logger if the headers were already sent]');
      return;
    }
    res.chromeLoggerData = res.chromeLoggerData || {
      'version': config.version,
      'columns': ['log', 'backtrace', 'type'],
      'rows': []
    };
    res.chromeLoggerData.rows.push([
      [data],
      new Error().stack.match(/(\n.*){2}\(([^:]+):([0-9]+):([0-9]+)/).slice(-3).join(':'),
      type
    ]);
    res.setHeader('X-ChromeLogger-Data', encode(res.chromeLoggerData));
  }

  this.middleware = function(req, res) {
    res.log            = log.bind(logger, res, '');
    res.warn           = log.bind(logger, res, 'warn');
    res.error          = log.bind(logger, res, 'error');
    res.info           = log.bind(logger, res, 'info');
    res.group          = log.bind(logger, res, 'group');
    res.groupEnd       = log.bind(logger, res, 'groupEnd');
    res.groupCollapsed = log.bind(logger, res, 'groupCollapsed');
    return;
  };
}
sys.inherits(ChromeLogger, events.EventEmitter);

module.exports = new ChromeLogger();