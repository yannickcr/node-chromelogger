var chromelogger = require('../../lib/chromelogger');
var express = require('express');

var app = express();

var test = 3;

app.use(chromelogger.middleware);

app.get('/', function(req, res) {
  res.chrome.time('Time Message');
  res.chrome.log('Simple message');
  res.chrome.log('Message', 'with', 4, 'parameters');
  res.chrome.log('Message from Node.js %s', process.version);
  res.chrome.log('Message with an Object', chromelogger);
  res.chrome.log('Message with an Object and a circular reference', req);
  res.chrome.warn('Warning message');
  res.chrome.error('Error message');
  res.chrome.info('Info message');
  res.chrome.table([{
    name:'First information',
    message: 'First message'
  }, {
    name:'Second information',
    message: 'Second message'
  }, {
    name:'Third information',
    message: 'Third message'
  }]);
  res.chrome.assert(test > 5, 'test is > 5');
  res.chrome.assert(test < 10, 'test is < 10');
  for (var i = 0; i < 2; i++) {
    res.chrome.count('Message in a loop');
  }
  res.chrome.group('Grouped messages');
  res.chrome.log('Message 1');
  res.chrome.log('Message 2');
  res.chrome.groupEnd();
  res.chrome.groupCollapsed('Grouped messages (collapsed)');
  res.chrome.log('Message 1');
  res.chrome.log('Message 2');
  res.chrome.groupEnd();
  res.chrome.timeEnd('Time Message');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.end();
  res.chrome.log('Attempt to log when the headers were already sent');
});

chromelogger.on('error', function(message) {
  console.log(message);
});

app.listen(7357);
