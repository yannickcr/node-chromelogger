var
  events = require('events'),
  sys = require('sys'),
  config = require('../package.json')
;

function ChromeLogger() {
  events.EventEmitter.call(this);

  var
    logger = this,
    stackRegEx = /^ +at (.* \()?(.+):([0-9]+):([0-9]+)\)?$/
  ;

  logger._initData = function(message) {
    return {
      'version': config.version,
      'columns': ['log', 'backtrace', 'type'],
      'rows': [message]
    };
  };

  logger._encode = function(data) {
    try {
      data = JSON.stringify(data);
    } catch (err) {
      logger.emit('error', err);
      data = JSON.stringify(logger._initData([
        [err.toString()],
        new Error().stack.split('\n')[3].match(stackRegEx).slice(-3).join(':'),
        'error'
      ]));
    }
    data = new Buffer(data, 'binary').toString('base64');
    return data;
  };

  logger._process = function(res, type) {
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
      new Error().stack.split('\n')[3].match(stackRegEx).slice(-3).join(':'),
      type
    ];
  };

  logger._log = function(res, type) {
    // Stop here if the headers were already sent
    if (res.headersSent) {
      logger.emit('error', '[Error: You can\'t log with Chrome Logger if the headers were already sent]');
      return;
    }

    // Construct the message
    var message = logger._process.apply(this, arguments);

    // Initialize the response object
    if (res._ChromeLoggerData) {
      res._ChromeLoggerData.rows.push(message);
    } else {
      res._ChromeLoggerData = logger._initData(message);
    }

    // Set the header
    res.setHeader('X-ChromeLogger-Data', logger._encode(res._ChromeLoggerData));
  };

  logger.middleware = function(req, res, next) {
    res.log            = logger._log.bind(logger, res, '');
    res.warn           = logger._log.bind(logger, res, 'warn');
    res.error          = logger._log.bind(logger, res, 'error');
    res.info           = logger._log.bind(logger, res, 'info');
    res.group          = logger._log.bind(logger, res, 'group');
    res.groupEnd       = logger._log.bind(logger, res, 'groupEnd');
    res.groupCollapsed = logger._log.bind(logger, res, 'groupCollapsed');
    if(typeof next === 'function') next();
  };
}
sys.inherits(ChromeLogger, events.EventEmitter);

module.exports = new ChromeLogger();
