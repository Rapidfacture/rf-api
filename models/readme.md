## Members

<dl>
<dt><a href="#originalResponse">originalResponse</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#send">send(err, data, successFunction)</a></dt>
<dd><p>default response function; adds error handling</p>
</dd>
<dt><a href="#error">error(err)</a></dt>
<dd><p>default error</p>
</dd>
<dt><a href="#errorInternal">errorInternal(err)</a></dt>
<dd><p>if error isn&#39;t handeled</p>
</dd>
<dt><a href="#errorBadRequest">errorBadRequest(err)</a></dt>
<dd><p>missing or wrong parameters</p>
</dd>
<dt><a href="#errorAuthorizationRequired">errorAuthorizationRequired(err)</a></dt>
<dd><p>not autorized for route</p>
</dd>
<dt><a href="#errorAccessDenied">errorAccessDenied(err)</a></dt>
<dd><p>request not allowed for user</p>
</dd>
<dt><a href="#errorNotFound">errorNotFound(err)</a></dt>
<dd><p>not found or not available</p>
</dd>
<dt><a href="#errorAlreadyExists">errorAlreadyExists(err)</a></dt>
<dd></dd>
<dt><a href="#errorNoLongerExists">errorNoLongerExists(err)</a></dt>
<dd><p>tried to save an entry wich was removed</p>
</dd>
<dt><a href="#register">register()</a></dt>
<dd><p>register further functions from other server modules</p>
</dd>
</dl>

<a name="originalResponse"></a>

## originalResponse
**Kind**: global variable  
<a name="send"></a>

## send(err, data, successFunction)
default response function; adds error handling

**Kind**: global function  

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
<a name="error"></a>

## error(err)
default error

**Kind**: global function  

| Param | Description |
| --- | --- |
| err | every datatype allowed |

**Example**  
```js
res.error("statusRed");
```
<a name="errorInternal"></a>

## errorInternal(err)
if error isn't handeled

**Kind**: global function  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorInternal("Database error");
```
<a name="errorBadRequest"></a>

## errorBadRequest(err)
missing or wrong parameters

**Kind**: global function  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorBadRequest("Missing id");
```
<a name="errorAuthorizationRequired"></a>

## errorAuthorizationRequired(err)
not autorized for route

**Kind**: global function  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorAuthorizationRequired();
```
<a name="errorAccessDenied"></a>

## errorAccessDenied(err)
request not allowed for user

**Kind**: global function  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorAccessDenied("You need be admin");
```
<a name="errorNotFound"></a>

## errorNotFound(err)
not found or not available

**Kind**: global function  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorNotFound("No user found");
```
<a name="errorAlreadyExists"></a>

## errorAlreadyExists(err)
**Kind**: global function  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorAlreadyExists();
```
<a name="errorNoLongerExists"></a>

## errorNoLongerExists(err)
tried to save an entry wich was removed

**Kind**: global function  

| Param | Description |
| --- | --- |
| err | string |

**Example**  
```js
res.errorNoLongerExists("User is gone");
```
<a name="register"></a>

## register()
register further functions from other server modules

**Kind**: global function  
**Example**  
```js
var answers = require("rf-load").require("API").answers;
answers.register(createPdf)
```
