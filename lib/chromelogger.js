var
  events    = require('events'),
  util      = require('util'),
  stringify = require('json-stringify-safe'),
  config    = require('../package.json')
;

function ChromeLogger() {
  events.EventEmitter.call(this);

  var
    logger = this,
    stackRegEx = /^ +at (.* \()?(.+):([0-9]+):([0-9]+)\)?$/,
    stackIndex = +process.version.replace(/v([0-9]+)\.([0-9]+).*/g, '$1$2') < 7 ? 4 : 3 // The stacktrace is different between Node.js <= 0.6 and >= 0.7
  ;

  logger._initData = function(message) {
    return {
      'version': config.version,
      'columns': ['log', 'backtrace', 'type'],
      'rows': [message]
    };
  };

  logger._process = function(res, type) {
    // Retrieve the data from the arguments
    data = Array.prototype.constructor.apply(this, arguments).slice(2);
    // Get the constructor name for each of the logged objects
    data.forEach(function(d) {
      if (typeof d !== 'object') return;
      d.___class_name = d.constructor.name;
    });

    // Get the backtrace
    var backtrace = new Error().stack.split('\n')[stackIndex].match(stackRegEx).slice(-3).join(':');
    // Set the backtrace to null if we log a group message or if we log the same line multiple time
    backtrace = /group/.test(type) || res._ChromeLoggerLastBacktrace === backtrace ? null : backtrace;
    // Update the last backtrace value
    res._ChromeLoggerLastBacktrace = backtrace || res._ChromeLoggerLastBacktrace;

    // Return the constructed message
    return [
      data,
      backtrace,
      type
    ];
  };

  logger._log = function(res, type) {
    // Stop here if the headers were already sent
    if (res.headersSent || res._header) {
      logger.emit('error', new Error('You can\'t log with Chrome Logger if the headers were already sent'));
    }

    // Construct the message
    var message = logger._process.apply(this, arguments);

    // Initialize the response object
    if (res._ChromeLoggerData) {
      res._ChromeLoggerData.rows.push(message);
    } else {
      res._ChromeLoggerData = logger._initData(message);
    }

    // Serialize and encode the data
    var data = new Buffer(stringify(res._ChromeLoggerData), 'binary').toString('base64');

    // Limit the log size to 240KB (Chrome's limit: 256KB for all headers)
    if (data.length > 245760) {
      res._ChromeLoggerData.rows.pop();
      logger.emit('error', new Error('You can\'t log more than 245760 Bytes of data in the headers. Current size: ' + data.length + ' Bytes'));
    }

    // Set the header
    res.setHeader('X-ChromeLogger-Data', data);
  };

  logger.middleware = function(req, res, next) {
    res.chrome = {
      log           : logger._log.bind(logger, res, ''),
      warn          : logger._log.bind(logger, res, 'warn'),
      error         : logger._log.bind(logger, res, 'error'),
      info          : logger._log.bind(logger, res, 'info'),
      group         : logger._log.bind(logger, res, 'group'),
      groupEnd      : logger._log.bind(logger, res, 'groupEnd'),
      groupCollapsed: logger._log.bind(logger, res, 'groupCollapsed')
    };
    if(typeof next === 'function') next();
  };
}
util.inherits(ChromeLogger, events.EventEmitter);

module.exports = new ChromeLogger();
