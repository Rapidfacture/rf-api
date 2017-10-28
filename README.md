# rf-api
⚠ unstable - do not use now ⚠

The API reduces bad code practices:

* very long code
* forgotten error handling
* nonuniform error messages (dependent on developer)
* linearize asynchron code

The response object has following methods:
 - _response
 - _request
 - _session
 - reqUrl
 - send
 - sendDocsRequired
 - error
 - errorCustom
 - ObjectId 

Further functions can be added as services.


## Getting Started

To install the module:

> npm install rf-api

### Example

Use `rf-load` to load the module:
```js
var API = require("rf-load").require("rf-api").API;
```
Use the `get`,`post` or `put` function in your API files:
```js
API.get('funcName', function(data, res) {
    // code to process the request here
});
```

Include `API.ServiceFactory.registerFunction(func);` to your package to register a new function as a service.

## Dependencies

Needs to have `mongoose`, `rf-log`, `rf-config` & `rf-load` to be installed.


## Legal Issues
* License: MIT
* Author: Rapidfacture GmbH
