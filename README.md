# Rapidfacture API
Express Middleware with plugin system that reduces bad code practices
 * shortens code
 * prevent forgotten error handling
 * uniform error messages
 * linearize asynchron code

Plugins
* [rf-api-mailer](https://www.npmjs.com/package/rf-api-mailer)
* [rf-api-thumbnail](https://www.npmjs.com/package/rf-api-thumbnail)
* [rf-api-url2pdf](https://www.npmjs.com/package/rf-api-url2pdf)

## Install

To install the module:

> npm install rf-api


```js

// prepare backend
var config = require('rf-config').init(__dirname); // config
var mongooseMulti = require('mongoose-multi'); // databases
var db = mongooseMulti.start(config.db.urls, config.paths.schemas);
var http = require('rf-http').start({ // webserver
   pathsWebserver: config.paths.webserver,
   port: config.port
});

// prepare api
var API = require('rf-api').start({app: http.app}); // needs express app

db.global.mongooseConnection.once('open', function () {
   // optional: start access control; has to be done before starting the websocket
   require('rf-acl').start({
      API: API,
      db: db,
      app: http.app,
      sessionSecret: dbSettings.sessionSecret.value
   });


 // start requests
 API.startApiFiles(config.paths.apis, function (startApi) {
    startApi(db, API, services);
 });
});
```


## Usage

Note:
* there are no url parameters used; the correspondig `http Factory` transfers a json objects to the API methods; this obj should include everything
* name your request properly

```js
// for read only stuff
API.get('funcName', function(req, res) {
    // code to process the request here
});
// for stuff with write access
API.post('funcName', function(req, res) {
    // code to process the request here
});
```

## req
convert obj structure of original express request
```js
{
  session            // extracted from rf-acl
  token              // extracted from rf-acl
  user               // extracted from rf-acl
  rights             // extracted from rf-acl
  data               // data from client
  originalRequest    // express req
}
```

## res
Middleware for express response; adds error handling.
The original express respones is also passed as `res.originalResponse`

### res.send()

default response function; adds error handling

Example: Simple
```js
res.send(err, data);
```

Example: respond from db with error handling
```js
db.user.groups  // send all groups back to client
  .find({})
  .exec(res.send);
```

Example: using the callback function
```js
createDocs()

function createDocs(){
  createDoc(function (err, doc){
    res.send(err, docs, processDocs);
  })
}

function processDocs(){
  console.log(docs)
  res.send(err, docs);
}
 // linearize asynchron code with the successFunction. instead of:
 //
 //   execute function A
 //     then execute function B
 //        afterwards execute function C
 //           afterwards execute function D
 //
 // the code is linearized:
 //
 // execute function A
 //
 // function A
 //    then execute function B
 //
 // function B
 //     then execute function C
 //
 // function C
 //   then execute function D
 //
 // advantages: better readabilty, automatic error names for each function
 ```

### res.errors
Send back error with specific error code
 ```js
res.error("statusRed")
// status 500; standard error; if error isn't handeled
```

```js
res.errorBadRequest("Missing id")
// status 400; missing or wrong parameters
```

```js
res.errorAuthorizationRequired()
// status 401; not autorized for route
```

```js
res.errorAccessDenied("You need be admin")
// status 403; request not allowed for user
```

```js
res.errorNotFound("No user found")
// status 404; not found or not available
```

```js
res.errorAlreadyExists("User exists")
// status 409
```

```js
res.errorNoLongerExists("User is gone")
// status 410; tried to save an entry wich was removed?
```

## services
provide plugged in functions from other rf-api-* modules

### Register functions
Example: register functions from other server modules
```js
var Services = API.Services.Services;
function createPdf(url, callback){
  createdPdfDoc(url, function(err, pdf){
      // callback always has the parameters mongoose like: err, docs
      callback(err, pdf)
  })
}
Services.register(createPdf)
```

## Development

Install the dev tools with

Then you can runs some test cases and eslint with:
> npm test

Generate Docs:
> npm run-script doc

## To Do
* testing
## Legal Issues
* License: MIT
* Author: Rapidfacture GmbH
