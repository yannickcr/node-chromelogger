# Node Chrome Logger Changelog

## 1.0.1
(04/28/2013)
- Add travis configuration
- Fixes for Node.js 0.6 and 0.8

## 1.0.0
(04/28/2013)
- Limit log size to 240KB
- Improve errors
- Remove backtrace for group, groupEnd and groupCollapsed messages
- Remove multiple backtraces for if we log in a loop
- API change: all logging functions are now in res.chrome

## 0.0.5
(04/28/2013)
- Add tests
- Small refactoring

## 0.0.4
(04/11/2013)
- Add support for logging with multiple arguments
- Log the serialization errors on the client 

## 0.0.3
(04/10/2013)
- Add Express support
- Fix backtrace under Windows

## 0.0.2
(04/10/2013)
- Add backtrace support
- Fix version in response header

## 0.0.1
(04/10/2013)
- First revision
