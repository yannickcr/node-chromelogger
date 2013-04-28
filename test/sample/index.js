var chromelogger = require('../../lib/chromelogger');
var http = require('http');

var server = http.createServer();

server.on('request', chromelogger.middleware);

server.on('request', function(req, res) {
  res.chrome.log('Simple message');
  res.chrome.log('Message', 'with', 4, 'parameters');
  res.chrome.log('Message from Node.js %s', process.version);
  res.chrome.log('Message with an Object', chromelogger);
  res.chrome.warn('Warning message');
  res.chrome.error('Error message');
  res.chrome.info('Info message');
  res.chrome.group('Grouped messages');
  res.chrome.log('Message 1');
  res.chrome.log('Message 2');
  res.chrome.groupEnd();
  res.chrome.groupCollapsed('Grouped messages (collapsed)');
  res.chrome.log('Message 1');
  res.chrome.log('Message 2');
  res.chrome.groupEnd();
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.end(JSON.stringify(res._ChromeLoggerData));
  res.chrome.log('Attempt to log when the headers were already sent');
});

chromelogger.on('error', function(message) {
  console.log(message);
});

server.listen(7357);