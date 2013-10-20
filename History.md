
1.1.1 / 2013-10-20
==================

 * fix global variable leak
 * fix tests under Windows
 * update mocha to latest version

1.1.0 / 2013-07-05
==================

 * add console.time / console.timeEnd support
 * add console.assert support
 * add console.count support

1.0.5 / 2013-06-25
==================

 * add console.table support
 * add version badge in README

1.0.4 / 2013-06-23
==================

 * fix recursive logging of ChromeLogger data
 * fix return on error
 * update mocha to latest version

1.0.3 / 2013-06-08
==================

 * fix deletion of too large headers
 * update json-stringify-safe and mocha to latest versions
 * add Coveralls badge in README

1.0.2 / 2013-05-03
==================

 * add support for objects with circular references
 * add Gemnasium badge in README

1.0.1 / 2013-04-28
==================

 * add travis configuration
 * fixes for Node.js 0.6 and 0.8

1.0.0 / 2013-04-28
==================

 * limit log size to 240KB
 * improve errors
 * remove backtrace for group, groupEnd and groupCollapsed messages
 * remove multiple backtraces if we log in a loop
 * API change: all logging functions are now in res.chrome

0.0.5 / 2013-04-28
==================

 * add tests
 * small refactoring

0.0.4 / 2013-04-11
==================

 * add support for logging with multiple arguments
 * log the serialization errors on the client

0.0.3 / 2013-04-10
==================

 * add Express support
 * fix backtrace under Windows

0.0.2 / 2013-04-10
==================

 * add backtrace support
 * fix version in response header

0.0.1 / 2013-04-10
==================
 * first revision
