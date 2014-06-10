# Node Chrome Logger

[![Maintenance Status][status-image]][status-url] [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][deps-image]][deps-url] [![Coverage Status][coverage-image]][coverage-url] [![Code Climate][climate-image]][climate-url]

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

[npm-url]: https://npmjs.org/package/chromelogger
[npm-image]: http://img.shields.io/npm/v/chromelogger.svg?style=flat

[travis-url]: https://travis-ci.org/yannickcr/node-chromelogger
[travis-image]: http://img.shields.io/travis/yannickcr/node-chromelogger/master.svg?style=flat

[deps-url]: https://gemnasium.com/yannickcr/node-chromelogger
[deps-image]: http://img.shields.io/gemnasium/yannickcr/node-chromelogger.svg?style=flat

[coverage-url]: https://coveralls.io/r/yannickcr/node-chromelogger?branch=master
[coverage-image]: http://img.shields.io/coveralls/yannickcr/node-chromelogger/master.svg?style=flat

[climate-url]: https://codeclimate.com/github/yannickcr/node-chromelogger
[climate-image]: http://img.shields.io/codeclimate/github/yannickcr/node-chromelogger.svg?style=flat

[status-url]: https://github.com/yannickcr/node-chromelogger/pulse
[status-image]: http://img.shields.io/badge/status-maintained-brightgreen.svg?style=flat
