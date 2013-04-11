var chromelogger = require('../lib/chromelogger');
var express = require('express');

var app = express();

app.use(chromelogger.middleware);

app.get('/', function(req, res) {
  res.log('Simple message');
  res.log('Message', 'with', 4, 'parameters');
  res.log('Message from Node.js %s', process.version);
  res.log('Message with an Object', chromelogger);
  res.warn('Warning message');
  res.error('Error message');
  res.info('Info message');
  res.group('Grouped messages');
  res.log('Message 1');
  res.log('Message 2');
  res.groupEnd();
  res.groupCollapsed('Grouped messages (collapsed)');
  res.log('Message 1');
  res.log('Message 2');
  res.groupEnd();
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.end(JSON.stringify(res._ChromeLoggerData));
  res.log('Attempt to log when the headers were already sent');
});

chromelogger.on('error', function(message) {
  console.log(message);
});

app.listen(7357);