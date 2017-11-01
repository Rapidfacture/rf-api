# Rapidfacture API
Express Middleware with plugin system that reduces bad code practices
 * shortens code
 * prevent forgotten error handling
 * uniform error messages
 * linearize asynchron code

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

## PeerDependencies
* `rf-log`
* `rf-load`

## Legal Issues
* License: MIT
* Author: Rapidfacture GmbH

## Usage

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
Note:
* there are no url parameters used; the correspondig `http Factory` transfers a json objects to the API methods; this obj should include everything
* name your request properly

@module Request
@desc convert obj structure of original express request

@module Response
@desc middleware for express response; adds error handling

@var originalResponse pass original express response

@function send
@desc  default response function; adds error handling
@param err every datatype allowed; sends an error if not 'null';
@param data every datatype allowed; optional
@param successFunction callback function; optional
@example
//simple
res.error("statusRed");
@example
//with callback

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
@example
// respond from db with error handling
db.user.groups  // send all groups back to client
  .find({})
  .exec(res.send);

@function error
@desc default error; try to extract an error code from err
@param err every datatype allowed
@example res.error("statusRed");

@function errorInternal
@desc error 500: if error isn't handeled
@param err string
@example res.errorInternal("Database error");

@function errorBadRequest
@desc error 400: missing or wrong parameters
@param err string
@example res.errorBadRequest("Missing id");

@function errorAuthorizationRequired
@desc error 401: not autorized for route
@param err string
@example res.errorAuthorizationRequired();

@function errorAccessDenied
@desc error 403: request not allowed for user
@param err string
@example res.errorAccessDenied("You need be admin");

@function errorNotFound
@desc error 404: not found or not available
@param err string
@example res.errorNotFound("No user found");

@function errorAlreadyExists
@desc error 409: already exists
@param err string
@example res.errorAlreadyExists();

@function errorNoLongerExists
@desc error 410: tried to save an entry wich was removed
@param err string
@example
res.errorNoLongerExists("User is gone");

# Services
plug in functions from other modules

@var res
@desc express response for error handling and sending docs; public to registred functions

@var Services
@desc public var that holds all registred services

### function

register functions from other server modules
@example
// register a function
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

@example
// execute a registred service function
var API = require("rf-load").require("API");

 API.post("get-pdf", function(req, res, services) {
   services.createPdf(req.data, function (pdf){
         var corrected = processPdf(pdf)
         res.send(corrected)
   })
 })
