var chromelogger = require('../lib/chromelogger');
var http = require('http');

var server = http.createServer();

server.on('request', chromelogger.middleware);

server.on('request', function(req, res) {
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

server.listen(7357);