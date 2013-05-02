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
describe('middleware', function(){

  var nextExecuted = false;
  chromelogger.middleware(null, res, function(){ nextExecuted = true; });

  describe('must set', function(){

    it('a chrome object', function(){
      assert.equal(typeof res.chrome, 'object', 'res.chrome missing');
    });

    it('a log function', function(){
      assert.equal(typeof res.chrome.log, 'function', 'res.chrome.log missing');
    });

    it('a warn function', function(){
      assert.equal(typeof res.chrome.warn, 'function', 'res.chrome.warn missing');
    });

    it('an error function', function(){
      assert.equal(typeof res.chrome.error, 'function', 'res.chrome.error missing');
    });

    it('an info function', function(){
      assert.equal(typeof res.chrome.info, 'function', 'res.chrome.info missing');
    });

    it('a group function', function(){
      assert.equal(typeof res.chrome.group, 'function', 'res.chrome.group missing');
    });

    it('a groupEnd function', function(){
      assert.equal(typeof res.chrome.groupEnd, 'function', 'res.chrome.groupEnd missing');
    });

    it('a groupCollapsed function', function(){
      assert.equal(typeof res.chrome.groupCollapsed, 'function', 'res.chrome.groupCollapsed missing');
    });

  });

  describe('must execute', function(){

    it('next function', function(){
      assert.equal(nextExecuted, true, 'next function not executed');
    });

  });

});

/*
 * Testing the logging functions
 */
describe('logging', function(){

  /*
   * Testing simple message logging and message structure
   */

  it('must set the x-chromelogger-data header', function(){

    // Log a message
    res.chrome.log('Simple message');

    assert.equal(typeof res._headers['x-chromelogger-data'], 'string', 'the x-chromelogger-data header is not set');
  });

  // Retrieve the message
  var data;
  it('must decode the x-chromelogger-data header', function(){

    assert.doesNotThrow(function() {
      data = new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii');
    }, 'the x-chromelogger-data header cannot be decoded to ascii');

  });

  it('must parse the x-chromelogger-data header', function(){

    assert.doesNotThrow(function() {
      data = JSON.parse(data);
    }, 'the x-chromelogger-data header cannot be parsed as JSON');

  });

  it('must set the version', function(){

    var verReg = /[0-9]+\.[0-9]+\.[0-9]+/;

    assert.equal(typeof data.version, 'string');
    assert.equal(data.version, config.version);
    assert(verReg.test(data.version), 'the version must match ' + verReg);

  });

  it('must set the columns', function(){

    assert.equal(typeof data.columns, 'object');
    assert.deepEqual(data.columns, ['log', 'backtrace', 'type']);

  });

  it('must set the rows', function(){

    var lineReg = /node-chromelogger\/test\/test\.js:[0-9]+:[0-9]+$/;

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
  it('must log a message with 4 parameters', function(){

    res.chrome.log('Message', 'with', 4, 'parameters');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[0], ['Message', 'with', 4, 'parameters']);

  });

  it('must log a message with a dynamic parameter', function(){

    res.chrome.log('Message from Node.js %s', process.version);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[0], ['Message from Node.js %s', process.version]);

  });

  it('must log a message with an Object', function(){

    res.chrome.log('Message with an Object', chromelogger);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[0][0], 'Message with an Object');
    assert.equal(message[0][1].___class_name, 'ChromeLogger');

  });

  // Warn
  it('must log a warning', function(){

    res.chrome.warn('Warning message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[2], 'warn');

  });

  // Error
  it('must log an error', function(){

    res.chrome.error('Error message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[2], 'error');

  });

  // Info
  it('must log an info', function(){

    res.chrome.info('Info message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[2], 'info');

  });

  // Group
  it('must start a grouped message', function(){

    res.chrome.group('Grouped messages');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[1], null, 'the group messages must not have a backtrace');
    assert.equal(message[2], 'group');

  });

  // GroupEnd
  it('must end a grouped message', function(){

    res.chrome.groupEnd();

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[1], null, 'the groupEnd messages must not have a backtrace');
    assert.equal(message[2], 'groupEnd');

  });

  // groupCollapsed
  it('must start a grouped message (collapsed)', function(){

    res.chrome.groupCollapsed('Grouped messages (collapsed)');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.equal(message[1], null, 'the groupCollapsed messages must not have a backtrace');
    assert.equal(message[2], 'groupCollapsed');

  });

  // Log in a loop
  it('must set a backtrace for only the first log message in a loop', function(){

    var lineReg = /node-chromelogger\/test\/test\.js:[0-9]+:[0-9]+$/;

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
  it('must throw an error when the headers are too big', function(){

    var limit = (240 * 1024) - res._headers['x-chromelogger-data'].length;
    var filler = new Array(limit).join('A'); // Create a big string to fill the headers

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

  // Headers already sent
  it('must throw an error when the headers was already sent', function(){

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
