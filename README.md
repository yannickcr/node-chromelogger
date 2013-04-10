# Node Chrome Logger

Implementation of the Chrome Logger protocol for Node.js

# Installation

```shell
npm install chromelogger
```

and install the [Chrome Logger extension](http://craig.is/writing/chrome-logger) in your Chrome browser.

# Usage

```javascript
var chromelogger = require('chromelogger');
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
});

server.listen(7357);
```

# License

MIT
