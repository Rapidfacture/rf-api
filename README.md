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
var Loader = require('rf-load').moduleLoader
var load = new Loader()
load.setModulePath(config.paths.modules)

// other stuff
load.file('db')
load.file('http')

// start request api
load.file('rf-api')

// plug in other modules into the api
load.module("rf-api-mailer");
```

## Usage

Note:
* there are no url parameters used; the correspondig `http Factory` transfers a json objects to the API methods; this obj should include everything
* name your request properly

```js
var API = require("rf-load").require("rf-api").API

// for read only stuff
API.get('funcName', function(req, res, services) {
    // code to process the request here
});
// for stuff with write access
API.post('funcName', function(req, res, services) {
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
res.error("statusRed");
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
Example: use the services
```js
var API = require("rf-load").require("API");

 API.post("get-pdf", function(req, res, services) {
   services.createPdf(req.data, function (pdf){
         var corrected = processPdf(pdf)
         res.send(corrected)
   })
 })
```
Example: register functions from other server modules
```js
var Services = require("rf-load").require("API").Services;
function createPdf(url, callback){
  var res = this.res // get response from parent service
  createdPdfDoc(url, function(err, pdf){
      if(err){
         res.error(err)
      }else{
         callback(pdf)
      }
  })
}
Services.register(createPdf)
```

## PeerDependencies
* `rf-log`
* `rf-load`

## Development

Install the dev tools with

Then you can runs some test cases and eslint with:
> npm test

Generate Docs:
> npm run-script doc

## To Do
* testing
* create a grunt task for mdextract
## Legal Issues
* License: MIT
* Author: Rapidfacture GmbH
