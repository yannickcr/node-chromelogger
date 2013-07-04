# Node Chrome Logger

[![NPM version](https://badge.fury.io/js/chromelogger.png)](https://npmjs.org/package/chromelogger) [![Build Status](https://secure.travis-ci.org/yannickcr/node-chromelogger.png)](http://travis-ci.org/yannickcr/node-chromelogger) [![Dependency Status](https://gemnasium.com/yannickcr/node-chromelogger.png)](https://gemnasium.com/yannickcr/node-chromelogger) [![Coverage Status](https://coveralls.io/repos/yannickcr/node-chromelogger/badge.png?branch=master)](https://coveralls.io/r/yannickcr/node-chromelogger?branch=master)

[Chrome Logger](http://craig.is/writing/chrome-logger) is a Google Chrome extension for debugging server side applications in the Chrome console.
This module is an implementation of the Chrome Logger protocol for Node.js, it allows you to log and inspect your server-side code directly in the Chrome console.

![](http://i.imgur.com/KHkYtMK.png)

# Installation

    $ npm install chromelogger

and install the [Chrome Logger extension](https://chrome.google.com/webstore/detail/chromephp/noaneddfkdjfnfdakjjmocngnfkfehhd) in your Chrome browser.

# Usage

```javascript
var chromelogger = require('chromelogger');
var http = require('http');

var server = http.createServer();

server.on('request', chromelogger.middleware);

server.on('request', function(req, res) {
  res.chrome.log('Hello from Node.js %s', process.version);
  res.end('Hello World');
});

server.listen(7357);
```

Node Chrome Logger provide several logging methods on the ServerResponse (res) object:
 * `res.chrome.log`
 * `res.chrome.warn`
 * `res.chrome.error`
 * `res.chrome.info`
 * `res.chrome.table`
 * `res.chrome.assert`
 * `res.chrome.count`
 * `res.chrome.time`
 * `res.chrome.timeEnd`
 * `res.chrome.group`
 * `res.chrome.groupEnd`
 * `res.chrome.groupCollapse`

These methods matches the [Console API of the Chrome Developer Tools](https://developers.google.com/chrome-developer-tools/docs/console-api).

## Usage as an Express middleware

```javascript
var chromelogger = require('chromelogger');
var express = require('express');

var app = express();

app.use(chromelogger.middleware);

app.get('/', function(req, res) {
  res.chrome.log('Hello from Express.js %s', express.version);
  res.end('Hello World');
});

app.listen(7357);
```

# Events

`error`: if an error occur (headers too large, logging after the headers were already sent)

```javascript
chromelogger.on('error', function(message) {
  console.log(message);
});
```

# License

Node Chrome Logger is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
