'use strict';

var
  events    = require('events'),
  util      = require('util'),
  stringify = require('json-stringify-safe'),
  config    = require('../package.json')
;

// Constructor
function ChromeLogger() {
  events.EventEmitter.call(this);
  this._stackRegEx = /^ +at (.* \()?(.+):([0-9]+):([0-9]+)\)?$/;
    // The stacktrace is different between Node.js <= 0.6 and >= 0.7
  this._stackIndex = +process.version.replace(/v([0-9]+)\.([0-9]+).*/g, '$1$2') < 7 ? 4 : 3;
  this._dataRef = /("x-chromelogger-data":")[0-9a-z+\/=]+(")/ig;
}
util.inherits(ChromeLogger, events.EventEmitter);

// Formatters to emulate special logging methods
ChromeLogger.prototype._formatters = {};

// Assert formatter
ChromeLogger.prototype._formatters.assert = function(res, type, data, backtrace) {
  if (data[0] === true) {
    return [];
  }
  type = 'error';
  data.shift();
  data[0] = 'Assertion failed: ' + data[0];
  return [data, backtrace, type];
};

// Time formatter
ChromeLogger.prototype._formatters.time = function(res, type, data/*, backtrace*/) {
  res._ChromeLogger.time[data[0]] = process.hrtime();
  return [];
};

// TimeEnd formatter
ChromeLogger.prototype._formatters.timeEnd = function(res, type, data, backtrace) {
  if (!res._ChromeLogger.time[data[0]]) {
    return [];
  }
  type = 'debug';
  var diff = process.hrtime(res._ChromeLogger.time[data[0]]);
  delete res._ChromeLogger.time[data[0]];
  data = [data[0] + ': ' + (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3) + 'ms'];
  return [data, backtrace, type];
};

// Count formatter
ChromeLogger.prototype._formatters.count = function(res, type, data, backtrace) {
  var label = data[0] + res._ChromeLogger.lastBacktrace;
  res._ChromeLogger.count[label] = res._ChromeLogger.count[label] ? res._ChromeLogger.count[label] + 1 : 1;
  type = 'debug';
  data = [data[0] + ': ' + res._ChromeLogger.count[label]];
  return [data, backtrace, type];
};

// Process the data and construct the message to log
ChromeLogger.prototype._process = function(res, type) {
  // Retrieve the data from the arguments
  var data = Array.prototype.constructor.apply(this, arguments).slice(2);
  // Get the constructor name for each of the logged objects
  data.forEach(function(d) {
    if (typeof d !== 'object') {
      return;
    }
    d.___class_name = d.constructor.name;
  });

  // Get the backtrace
  var backtrace = new Error().stack.split('\n')[this._stackIndex].match(this._stackRegEx).slice(-3).join(':');
  // Set the backtrace to null if we log a group message or if we log the same line multiple time
  backtrace = /group/.test(type) || res._ChromeLogger.lastBacktrace === backtrace ? null : backtrace;
  // Update the last backtrace value
  res._ChromeLogger.lastBacktrace = backtrace || res._ChromeLogger.lastBacktrace;

  if (this._formatters[type]) {
    return this._formatters[type](res, type, data, backtrace);
  } else {
    return [data, backtrace, type];
  }
};

// Generic logging method
ChromeLogger.prototype._log = function(res) {
  // Stop here if the headers were already sent
  if (res.headersSent || res._header) {
    return this.emit('error', new Error('You can\'t log with Chrome Logger if the headers were already sent'));
  }

  // Initialize ChromeLogger data structure
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
  var message = this._process.apply(this, arguments);

  // Exit if, after processing, there is no new message to log
  if (!message.length) {
    return;
  }

  // Push the message in the queue
  res._ChromeLogger.data.rows.push(message);

  var data = stringify(res._ChromeLogger.data);         // Serialize
  data = data.replace(this._dataRef, '$1[Circular]$2'); // Replace the references to the ChromeLogger data
  data = new Buffer(data, 'binary').toString('base64'); // Encode

  // Limit the log size to 240KB (Chrome's limit: 256KB for all headers)
  if (data.length > 245760) {
    res._ChromeLogger.data.rows.pop();
    return this.emit('error', new Error(
      'You can\'t log more than 245760 Bytes of data in the headers. ' +
      'Current size: ' + data.length + ' Bytes'
    ));
  }

  // Set the header
  res.setHeader('X-ChromeLogger-Data', data);
};

// Middleware, add the logging methods to the response object
ChromeLogger.prototype.middleware = function(req, res, next) {
  res.chrome = {
    log           : this._log.bind(this, res, ''),
    warn          : this._log.bind(this, res, 'warn'),
    error         : this._log.bind(this, res, 'error'),
    info          : this._log.bind(this, res, 'info'),
    table         : this._log.bind(this, res, 'table'),
    assert        : this._log.bind(this, res, 'assert'),
    count         : this._log.bind(this, res, 'count'),
    time          : this._log.bind(this, res, 'time'),
    timeEnd       : this._log.bind(this, res, 'timeEnd'),
    group         : this._log.bind(this, res, 'group'),
    groupEnd      : this._log.bind(this, res, 'groupEnd'),
    groupCollapsed: this._log.bind(this, res, 'groupCollapsed')
  };
  if(typeof next === 'function') {
    next();
  }
};

module.exports = new ChromeLogger();
