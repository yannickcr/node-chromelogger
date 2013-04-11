var
  events = require('events'),
  sys = require('sys'),
  config = require('../package.json')
;

function ChromeLogger() {
  events.EventEmitter.call(this);
  var logger = this;

  var encode = function(data) {
    try {
      data = JSON.stringify(data);
    } catch (err) {
      logger.emit('error', err);
      data = ''; // Should log the error client-side
    }
    data = new Buffer(data, 'binary').toString('base64');
    return data;
  };

  var process = function(res, type) {
    // Retrieve the data from the arguments
    data = Array.prototype.constructor.apply(this, arguments).slice(2);
    // Get the constructor name for each of the logged objects
    data.forEach(function(d) {
      if (typeof d !== 'object') return;
      d.___class_name = d.constructor.name;
    });

    // Return the constructed message
    return [
      data,
      new Error().stack.split('\n')[3].match(/^ +at (.* \()?(.+):([0-9]+):([0-9]+)\)?$/).slice(-3).join(':'),
      type
    ];
  };

  function log(res, type) {
    // Stop here if the headers were already sent
    if (res.headersSent) {
      logger.emit('error', '[Error: You can\'t log with Chrome Logger if the headers were already sent]');
      return;
    }

    // Construct the message
    var message = process.apply(this, arguments);

    // Retrieve the stored data (if any) then add the new message
    if (res._ChromeLoggerData) {
      res._ChromeLoggerData.rows.push(message);
    } else {
      res._ChromeLoggerData = {
        'version': config.version,
        'columns': ['log', 'backtrace', 'type'],
        'rows': [message]
      };
    }

    // Set the header
    res.setHeader('X-ChromeLogger-Data', encode(res._ChromeLoggerData));
  }

  this.middleware = function(req, res, next) {
    res.log            = log.bind(logger, res, '');
    res.warn           = log.bind(logger, res, 'warn');
    res.error          = log.bind(logger, res, 'error');
    res.info           = log.bind(logger, res, 'info');
    res.group          = log.bind(logger, res, 'group');
    res.groupEnd       = log.bind(logger, res, 'groupEnd');
    res.groupCollapsed = log.bind(logger, res, 'groupCollapsed');
    if(typeof next === 'function') next();
  };
}
sys.inherits(ChromeLogger, events.EventEmitter);

module.exports = new ChromeLogger();
