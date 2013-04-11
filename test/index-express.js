var chromelogger = require('../lib/chromelogger');
var express = require('express');

var app = express();

app.use(chromelogger.middleware);

app.get('/', function(req, res) {
  res.log('Log from ChromeLogger');
  res.warn('Warning from ChromeLogger');
  res.error('Error from ChromeLogger');
  res.info('Info from ChromeLogger');
  res.group('Group from ChromeLogger');
  res.groupEnd('GroupEnd from ChromeLogger');
  res.groupCollapsed('GroupCollapsed from ChromeLogger');
  res.end('Hello World');
  res.log('Fail from ChromeLogger');
});

chromelogger.on('error', function(message) {
  console.log(message);
});

app.listen(7357);