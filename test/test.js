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

    it('a log function', function(){
      assert.equal(typeof res.log, 'function', 'res.log missing');
    });

    it('a warn function', function(){
      assert.equal(typeof res.warn, 'function', 'res.warn missing');
    });

    it('an error function', function(){
      assert.equal(typeof res.error, 'function', 'res.error missing');
    });

    it('an info function', function(){
      assert.equal(typeof res.info, 'function', 'res.info missing');
    });

    it('a group function', function(){
      assert.equal(typeof res.group, 'function', 'res.group missing');
    });

    it('a groupEnd function', function(){
      assert.equal(typeof res.groupEnd, 'function', 'res.groupEnd missing');
    });

    it('a groupCollapsed function', function(){
      assert.equal(typeof res.groupCollapsed, 'function', 'res.groupCollapsed missing');
    });

  });

  describe('must execute', function(){

    it('next function', function(){
      assert.equal(nextExecuted, true, 'next function not executed');
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

  // Log a message
  res.log('Simple message');

  it('must set the x-chromelogger-data header', function(){
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
    assert.notStrictEqual(data.version.match(verReg), null, 'the version must match ' + verReg);

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
    assert.notStrictEqual(message[1].match(lineReg), null, 'the error line must match' + lineReg);

    assert.equal(typeof message[2], 'string');
    assert.strictEqual(message[2], '');

  });

  /*
   * Testing messages types
   */

  // Log
  it('must log a message with 4 parameters', function(){

    res.log('Message', 'with', 4, 'parameters');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[0], ['Message', 'with', 4, 'parameters']);

  });

  it('must log a message with a dynamic parameter', function(){

    res.log('Message from Node.js %s', process.version);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[0], ['Message from Node.js %s', process.version]);

  });

  it('must log a message with an Object', function(){

    res.log('Message with an Object', chromelogger);

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[0][0], 'Message with an Object');
    assert.deepEqual(message[0][1].___class_name, 'ChromeLogger');

  });

  // Warn
  it('must log a warning', function(){

    res.warn('Warning message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[2], 'warn');

  });

  // Error
  it('must log an error', function(){

    res.error('Error message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[2], 'error');

  });

  // Info
  it('must log an info', function(){

    res.info('Info message');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[2], 'info');

  });

  // Group
  it('must start a grouped message', function(){

    res.group('Grouped messages');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[2], 'group');

  });

  // GroupEnd
  it('must end a grouped message', function(){

    res.groupEnd();

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[2], 'groupEnd');

  });

  // groupCollapsed
  it('must start a grouped message (collapsed)', function(){

    res.groupCollapsed('Grouped messages (collapsed)');

    var data = JSON.parse(new Buffer(res._headers['x-chromelogger-data'], 'base64').toString('ascii'));
    var message = data.rows.pop();
    assert.deepEqual(message[2], 'groupCollapsed');

  });

  // Headers too big
  it('must throw an error when the headers are too big', function(){

    var limit = (240 * 1024) - res._headers['x-chromelogger-data'].length;
    var filler = new Array(limit).join('A'); // Create a big string to fill the headers

    assert.throws(
      function() {
        res.log(filler);
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
        res.log('Attempt to log when the headers were already sent');
      },
      function(err) {
        if (/headers were already sent/.test(err.message)) {
          return true;
        }
      }
    );

  });

});