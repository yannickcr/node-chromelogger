'use strict';

var
  assert = require('assert'),
  chromelogger = require('../lib/chromelogger'),
  config = require('../package.json'),
  OutgoingMessage = new require('http').OutgoingMessage
;

var res = new OutgoingMessage();

/*
 * Testing the middleware execution
 */
describe('middleware', function() {

  var nextExecuted = false;
  chromelogger.middleware(null, res, function() { nextExecuted = true; });

  describe('must set', function() {

    it('a chrome object', function() {
      assert.equal(typeof res.chrome, 'object', 'res.chrome missing');
    });

    it('a log function', function() {
      assert.equal(typeof res.chrome.log, 'function', 'res.chrome.log missing');
    });

    it('a warn function', function() {
      assert.equal(typeof res.chrome.warn, 'function', 'res.chrome.warn missing');
    });

    it('an error function', function() {
      assert.equal(typeof res.chrome.error, 'function', 'res.chrome.error missing');
    });

    it('an info function', function() {
      assert.equal(typeof res.chrome.info, 'function', 'res.chrome.info missing');
    });

    it('a table function', function() {
      assert.equal(typeof res.chrome.table, 'function', 'res.chrome.table missing');
    });

    it('an assert function', function() {
      assert.equal(typeof res.chrome.assert, 'function', 'res.chrome.assert missing');
    });

    it('a count function', function() {
      assert.equal(typeof res.chrome.count, 'function', 'res.chrome.count missing');
    });

    it('a time function', function() {
      assert.equal(typeof res.chrome.time, 'function', 'res.chrome.time missing');
    });

    it('a timeEnd function', function() {
      assert.equal(typeof res.chrome.timeEnd, 'function', 'res.chrome.timeEnd missing');
    });

    it('a group function', function() {
      assert.equal(typeof res.chrome.group, 'function', 'res.chrome.group missing');
    });

    it('a groupEnd function', function() {
      assert.equal(typeof res.chrome.groupEnd, 'function', 'res.chrome.groupEnd missing');
    });

    it('a groupCollapsed function', function() {
      assert.equal(typeof res.chrome.groupCollapsed, 'function', 'res.chrome.groupCollapsed missing');
    });

  });

  describe('must execute', function() {

    it('next function', function() {
      assert.equal(nextExecuted, true, 'next function not executed');
    });

  });

});

/*
 * Testing the logging functions
 */
describe('logging', function() {

  /*
   * Testing simple message logging and message structure
   */

  it('must set the x-chromelogger-data header', function() {

    // Log a message
    res.chrome.log('Simple message');

    assert.equal(typeof res._headers['x-chromelogger-data'], 'string', 'the x-chromelogger-data header is not set');
  });

  // Retrieve the message
  var data;
  it('must decode the x-chromelogger-data header', function() {

    assert.doesNotThrow(function() {
      data = new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii');
    }, 'the x-chromelogger-data header cannot be decoded to ascii');

  });

  it('must parse the x-chromelogger-data header', function() {

    assert.doesNotThrow(function() {
      data = JSON.parse(data);
    }, 'the x-chromelogger-data header cannot be parsed as JSON');

  });

  it('must set the version', function() {

    var verReg = /[0-9]+\.[0-9]+\.[0-9]+/;

    assert.equal(typeof data.version, 'string');
    assert.equal(data.version, config.version);
    assert(verReg.test(data.version), 'the version must match ' + verReg);

  });

  it('must set the columns', function() {

    assert.equal(typeof data.columns, 'object');
    assert.deepEqual(data.columns, ['log', 'backtrace', 'type']);

  });

  it('must set the rows', function() {

    var lineReg = /node-chromelogger(\/|\\)test(\/|\\)test\.js:[0-9]+:[0-9]+$/;

    assert.equal(typeof data.rows, 'object');

    var message = data.rows.pop();

    assert.equal(typeof message, 'object');
    assert.equal(typeof message[0], 'object');
    assert.equal(typeof message[0][0], 'string');
    assert.equal(message[0][0], 'Simple message');

    assert.equal(typeof message[1], 'string');
    assert(lineReg.test(message[1]), 'the error line must match' + lineReg);

    assert.equal(typeof message[2], 'string');
    assert.strictEqual(message[2], '');

  });

  /*
   * Testing messages types
   */

  // Log
  it('must log a message with 4 parameters', function() {

    res.chrome.log('Message', 'with', 4, 'parameters');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[0], ['Message', 'with', 4, 'parameters']);

  });

  it('must log a message with a dynamic parameter', function() {

    res.chrome.log('Message from Node.js %s', process.version);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[0], ['Message from Node.js %s', process.version]);

  });

  it('must log a message with an Object', function() {

    res.chrome.log('Message with an Object', chromelogger);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0][0], 'Message with an Object');
    assert.equal(message[0][1].___class_name, 'ChromeLogger');

  });

  it('must log a message with an Object which contains a circular reference', function() {

    res.chrome.log('Message with an Object and a circular reference', res);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0][0], 'Message with an Object and a circular reference');
    assert.equal(message[0][1].___class_name, 'OutgoingMessage');

  });

  // Warn
  it('must log a warning', function() {

    res.chrome.warn('Warning message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[2], 'warn');

  });

  // Error
  it('must log an error', function() {

    res.chrome.error('Error message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[2], 'error');

  });

  // Info
  it('must log an info', function() {

    res.chrome.info('Info message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[2], 'info');

  });

  // Table
  it('must log an objects table', function() {

    res.chrome.table([
      {
        name:'First information',
        message: 'First message'
      }, {
        name:'Second information',
        message: 'Second message'
      }, {
        name:'Third information',
        message: 'Third message'
      }
    ]);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[2], 'table');

  });

  // Assert
  it('must log a failed assertion message', function() {

    var test = 3;

    res.chrome.assert(test > 5, 'test is > 5');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0], 'Assertion failed: test is > 5', 'the assertion message is not properly set');
    assert.equal(message[2], 'error');

  });

  it('must not log a successful assertion message', function() {

    var test = 10;

    res.chrome.log('Testing "test" variable value');
    res.chrome.assert(test > 5, 'test is > 5');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0], 'Testing "test" variable value', 'a successful assertion must not be logged');
    assert.equal(message[2], '');

  });

  // Count
  it('must log the number of time the line has been invoked in a loop', function() {

    for (var i = 0; i < 3; i++) {
      res.chrome.count('Message in a loop');
    }

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0], 'Message in a loop: 3');
    assert.equal(message[2], 'debug');

  });

  it('must log the number of time the line with different labels has been invoked in a loop', function() {

    for (var i = 0; i < 3; i++) {
      res.chrome.count('Message ' + (i % 2));
    }

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0], 'Message 0: 2');
    assert.equal(message[2], 'debug');
    message = data.rows.pop();
    assert.equal(message[0], 'Message 1: 1');
    assert.equal(message[2], 'debug');

  });

  // Time
  it('must start a timer', function() {

    res.chrome.log('Starting timer');
    res.chrome.time('Timer');

    // Warning: use a private property
    var time = res._ChromeLogger.time.Timer;
    assert.equal(typeof time, 'object');
    assert.equal(typeof time[0], 'number');
    assert.equal(typeof time[1], 'number');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0], 'Starting timer', 'starting a timer must not log anything');
  });

  // TimeEnd
  it('must not log anything if we try to stop an unknown timer', function() {
    res.chrome.log('Stopping unknown timer');
    res.chrome.timeEnd('Unknown timer');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0], 'Stopping unknown timer', 'stopping an unknown timer must not log anything');
  });

  it('must log the elapsed time between the time and timeEnd calls', function() {

    var timeReg = /^Timer: [0-9\.]+ms$/;

    res.chrome.timeEnd('Timer');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert(timeReg.test(message[0]), 'the time message must match' + timeReg);
    assert.equal(message[2], 'debug');

    // Warning: use a private property
    assert.equal(typeof res._ChromeLogger.time.Timer, 'undefined', 'the timer must be removed from the queue');
  });

  // Group
  it('must start a grouped message', function() {

    res.chrome.group('Grouped messages');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[1], null, 'the group messages must not have a backtrace');
    assert.equal(message[2], 'group');

  });

  // GroupEnd
  it('must end a grouped message', function() {

    res.chrome.groupEnd();

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[1], null, 'the groupEnd messages must not have a backtrace');
    assert.equal(message[2], 'groupEnd');

  });

  // groupCollapsed
  it('must start a grouped message (collapsed)', function() {

    res.chrome.groupCollapsed('Grouped messages (collapsed)');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[1], null, 'the groupCollapsed messages must not have a backtrace');
    assert.equal(message[2], 'groupCollapsed');

  });

  // Log in a loop
  it('must set a backtrace for only the first log message in a loop', function() {

    var lineReg = /node-chromelogger(\/|\\)test(\/|\\)test\.js:[0-9]+:[0-9]+$/;

    for(var i = 0; i < 2; i++) {
      res.chrome.log('Test');
    }

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message2 = data.rows.pop();
    var message1 = data.rows.pop();
    assert(lineReg.test(message1[1]), 'the first log message in a loop must have a backtrace');
    assert.equal(message2[1], null, 'the second log message in a loop must not have a backtrace');

  });

  // Headers too big
  describe('when the headers are too big', function() {

    var limit, filler;

    it('must throw an error', function() {

      limit = (240 * 1024) - res._headers['x-chromelogger-data'].length;
      filler = new Array(limit).join('A'); // Create a big string to fill the headers

      assert.throws(
        function() {
          res.chrome.log(filler);
        },
        function(err) {
          if (/You can\'t log more than 245760 Bytes of data in the headers/.test(err.message)) {
            return true;
          }
        }
      );

    });

    it('must remove the last header from the queue', function() {

      // Warning: use a private property
      var message = res._ChromeLogger.data.rows[res._ChromeLogger.data.rows.length - 1][0][0];
      assert.notEqual(filler, message);

    });

    it('must be able to add another header', function() {

      assert.doesNotThrow(
        function() {
          res.chrome.log('Test');
        }
      );

    });

  });

  // Log an object with the ChromeLogger data
  describe('when logging an object containing the ChromeLogger data', function() {

    it('must replace the chromelogger data with a [Circular] string', function() {

      var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
      assert.equal(data.rows[4][0][1]._headers['x-chromelogger-data'], '[Circular]');

    });

  });

  describe('when the headers was already sent', function() {

    // Headers already sent
    it('must throw an error', function() {

      res._header = res._header || true; // Hack related to Node.js internals
      res.end();

      assert.throws(
        function() {
          res.chrome.log('Attempt to log when the headers were already sent');
        },
        function(err) {
          if (/headers were already sent/.test(err.message)) {
            return true;
          }
        }
      );

    });

  });

});
