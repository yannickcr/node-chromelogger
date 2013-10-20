'use strict';

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
    // The stacktrace is different between Node.js <= 0.6 and >= 0.7
    stackIndex = +process.version.replace(/v([0-9]+)\.([0-9]+).*/g, '$1$2') < 7 ? 4 : 3,
    dataRef = /("x-chromelogger-data":")[0-9a-z+\/=]+(")/ig
  ;

  logger._process = function(res, type) {
    // Retrieve the data from the arguments
    var data = Array.prototype.constructor.apply(this, arguments).slice(2);
    // Get the constructor name for each of the logged objects
    data.forEach(function(d) {
      if (typeof d !== 'object') {
        return;
      }
      d.___class_name = d.constructor.name;
    });

    // Emulate Assert support
    if (type === 'assert') {
      if (data[0] === true) {
        return [];
      } else {
        type = 'error';
        data.shift();
        data[0] = 'Assertion failed: ' + data[0];
      }
    }

    // Emulate Time support
    if (type === 'time') {
      res._ChromeLogger.time[data[0]] = process.hrtime();
      return [];
    }

    // Emulate TimeEnd support
    if (type === 'timeEnd') {
      if (!res._ChromeLogger.time[data[0]]) {
        return [];
      }
      type = 'debug';
      var diff = process.hrtime(res._ChromeLogger.time[data[0]]);
      delete res._ChromeLogger.time[data[0]];
      data = [data[0] + ': ' + (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3) + 'ms'];
    }

    // Get the backtrace
    var backtrace = new Error().stack.split('\n')[stackIndex].match(stackRegEx).slice(-3).join(':');
    // Set the backtrace to null if we log a group message or if we log the same line multiple time
    backtrace = /group/.test(type) || res._ChromeLogger.lastBacktrace === backtrace ? null : backtrace;
    // Update the last backtrace value
    res._ChromeLogger.lastBacktrace = backtrace || res._ChromeLogger.lastBacktrace;

    // Emulate Count support
    if (type === 'count') {
      var label = data[0] + res._ChromeLogger.lastBacktrace;
      res._ChromeLogger.count[label] = res._ChromeLogger.count[label] ? res._ChromeLogger.count[label] + 1 : 1;
      type = 'debug';
      data = [data[0] + ': ' + res._ChromeLogger.count[label]];
    }

    // Return the constructed message
    return [
      data,
      backtrace,
      type
    ];
  };

  logger._log = function(res) {
    // Stop here if the headers were already sent
    if (res.headersSent || res._header) {
      return logger.emit('error', new Error('You can\'t log with Chrome Logger if the headers were already sent'));
    }

    if (!res._ChromeLogger) {
      res._ChromeLogger = {
        data: {
          version: config.version,
          columns: ['log', 'backtrace', 'type'],
          rows: []
        },
        count: {},
        time: {}
      };
    }

    // Construct the message
    var message = logger._process.apply(this, arguments);

    // Exit if, after processing, there is no new message to log
    if (!message.length) {
      return;
    }

    // Push the message in the queue
    res._ChromeLogger.data.rows.push(message);

    var data = stringify(res._ChromeLogger.data);         // Serialize
    data = data.replace(dataRef, '$1[Circular]$2');       // Replace the references to the ChromeLogger data
    data = new Buffer(data, 'binary').toString('base64'); // Encode

    // Limit the log size to 240KB (Chrome's limit: 256KB for all headers)
    if (data.length > 245760) {
      res._ChromeLogger.data.rows.pop();
      return logger.emit('error', new Error(
        'You can\'t log more than 245760 Bytes of data in the headers. ' +
        'Current size: ' + data.length + ' Bytes'
      ));
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
      table         : logger._log.bind(logger, res, 'table'),
      assert        : logger._log.bind(logger, res, 'assert'),
      count         : logger._log.bind(logger, res, 'count'),
      time          : logger._log.bind(logger, res, 'time'),
      timeEnd       : logger._log.bind(logger, res, 'timeEnd'),
      group         : logger._log.bind(logger, res, 'group'),
      groupEnd      : logger._log.bind(logger, res, 'groupEnd'),
      groupCollapsed: logger._log.bind(logger, res, 'groupCollapsed')
    };
    if(typeof next === 'function') {
      next();
    }
  };
}
util.inherits(ChromeLogger, events.EventEmitter);

module.exports = new ChromeLogger();
