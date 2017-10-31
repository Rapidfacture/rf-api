<a name="module_Response"></a>

## Response
middleware for express response; adds error handling


* [Response](#module_Response)
    * [~originalResponse](#module_Response..originalResponse)
    * [~send(err, data, successFunction)](#module_Response..send)
    * [~error(err)](#module_Response..error)
    * [~errorInternal(err)](#module_Response..errorInternal)
    * [~errorBadRequest(err)](#module_Response..errorBadRequest)
    * [~errorAuthorizationRequired(err)](#module_Response..errorAuthorizationRequired)
    * [~errorAccessDenied(err)](#module_Response..errorAccessDenied)
    * [~errorNotFound(err)](#module_Response..errorNotFound)
    * [~errorAlreadyExists(err)](#module_Response..errorAlreadyExists)
    * [~errorNoLongerExists(err)](#module_Response..errorNoLongerExists)
    * [~register()](#module_Response..register)

<a name="module_Response..originalResponse"></a>

### Response~originalResponse
**Kind**: inner property of [<code>Response</code>](#module_Response)  
<a name="module_Response..send"></a>

### Response~send(err, data, successFunction)
default response function; adds error handling

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | every datatype allowed; sends an error if not 'null'; |
| data | every datatype allowed; optional |
| successFunction | callback function; optional |

**Example**  
```js
simple
res.error("statusRed");
```
**Example**  
```js
with callback
res.send(err, docs, processDocs);
function processDocs(docs){
  console.log(docs)
});
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
**Example**  
```js
respond from db with error handling
db.user.groups  // send all groups back to client
  .find({})
  .exec(res.send);
```
<a name="module_Response..error"></a>

### Response~error(err)
default error

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | every datatype allowed |

**Example**  
```js
res.error("statusRed");
```
<a name="module_Response..errorInternal"></a>

### Response~errorInternal(err)
if error isn't handeled

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorInternal("Database error");
```
<a name="module_Response..errorBadRequest"></a>

### Response~errorBadRequest(err)
missing or wrong parameters

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorBadRequest("Missing id");
```
<a name="module_Response..errorAuthorizationRequired"></a>

### Response~errorAuthorizationRequired(err)
not autorized for route

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorAuthorizationRequired();
```
<a name="module_Response..errorAccessDenied"></a>

### Response~errorAccessDenied(err)
request not allowed for user

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorAccessDenied("You need be admin");
```
<a name="module_Response..errorNotFound"></a>

### Response~errorNotFound(err)
not found or not available

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorNotFound("No user found");
```
<a name="module_Response..errorAlreadyExists"></a>

### Response~errorAlreadyExists(err)
**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorAlreadyExists();
```
<a name="module_Response..errorNoLongerExists"></a>

### Response~errorNoLongerExists(err)
tried to save an entry wich was removed

**Kind**: inner method of [<code>Response</code>](#module_Response)  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorNoLongerExists("User is gone");
```
<a name="module_Response..register"></a>

### Response~register()
register further functions from other server modules

**Kind**: inner method of [<code>Response</code>](#module_Response)  
**Example**  
```js
var answers = require("rf-load").require("API").answers;
answers.register(createPdf)
```
