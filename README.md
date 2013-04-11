# Node Chrome Logger

[Chrome Logger](http://craig.is/writing/chrome-logger) is a Google Chrome extension for debugging server side applications in the Chrome console.
This module is an implementation of the Chrome Logger protocol for Node.js, it allows you to log and inspect your server-side code directly in the Chrome console.

# Installation

```shell
npm install chromelogger
```

and install the [Chrome Logger extension](https://chrome.google.com/webstore/detail/chromephp/noaneddfkdjfnfdakjjmocngnfkfehhd) in your Chrome browser.

# Usage

```javascript
var chromelogger = require('chromelogger');
var http = require('http');

var server = http.createServer();

server.on('request', chromelogger.middleware);

server.on('request', function(req, res) {
  res.log('Log from ChromeLogger');
  res.end('Hello World');
});

server.listen(7357);
```

Node Chrome Logger provide several logging methods on the ServerResponse (res) object:
 * `res.log`
 * `res.warn`
 * `res.error`
 * `res.info`
 * `res.group`
 * `res.groupEnd`
 * `res.groupCollapse`

These methods matches the [Console API of the Chrome Developer Tools](https://developers.google.com/chrome-developer-tools/docs/console-api).

## Usage as an Express middleware

```javascript
var chromelogger = require('../lib/chromelogger');
var express = require('express');

var app = express();

app.use(chromelogger.middleware);

app.get('/', function(req, res) {
  res.log('Log from ChromeLogger');
  res.end('Hello World');
});

app.listen(7357);
```

# Events

There are different events that the Node Chrome Logger module can emits.

`error`: if an error occur (problem during JSON serialization, logging after the headers were already sent)

```javascript
chromelogger.on('error', function(message) {
  console.log(message);
});
```

# License

MIT
