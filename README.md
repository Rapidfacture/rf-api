## Modules

<dl>
<dt><a href="#module_API">API</a></dt>
<dd><h1 id="rapidfacture-api">Rapidfacture API</h1>
<p>Express Middleware with plugin system that reduces bad code practices</p>
<ul>
<li>shortens code</li>
<li>prevent forgotten error handling</li>
<li>uniform error messages</li>
<li>linearize asynchron code</li>
</ul>
<h2 id="install">Install</h2>
<p>To install the module:</p>
<blockquote>
<p>npm install rf-api</p>
</blockquote>
<pre><code class="language-javascript">var Loader = require(&#39;rf-load&#39;).moduleLoader
var load = new Loader()
load.setModulePath(config.paths.modules)

// other stuff
load.file(&#39;db&#39;)
load.file(&#39;http&#39;)

// start request api
load.file(&#39;rf-api&#39;)

// plug in other modules into the api
load.module(&quot;rf-api-mailer&quot;);
</code></pre>
<h2 id="usage">Usage</h2>
<pre><code class="lang-js">var API = require(&quot;rf-load&quot;).require(&quot;rf-api&quot;).API

// for read only stuff
API.get(&#39;funcName&#39;, function(data, res, services) {
    // code to process the request here
});
// for stuff with write access
API.post(&#39;funcName&#39;, function(data, res, services) {
    // code to process the request here
});
</code></pre>
<p>Note:</p>
<ul>
<li>there are no url parameters used; the correspondig <code>http Factory</code> transfers a json objects to the API methods; this obj should include everything</li>
<li>name your request properly</li>
</ul>
<h2 id="peerdependencies">PeerDependencies</h2>
<ul>
<li><code>rf-log</code></li>
<li><code>rf-load</code></li>
</ul>
<h2 id="legal-issues">Legal Issues</h2>
<ul>
<li>License: MIT</li>
<li>Author: Rapidfacture GmbH</li>
</ul>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Request">Request</a></dt>
<dd></dd>
<dt><a href="#Response">Response</a></dt>
<dd></dd>
<dt><a href="#Services">Services</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#originalResponse">originalResponse</a></dt>
<dd></dd>
<dt><a href="#Services">Services</a></dt>
<dd><p>express response for error handling and sending docs; public to registred functions</p>
</dd>
<dt><a href="#Services">Services</a></dt>
<dd><p>public var that holds all registred services</p>
</dd>
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
<dd><p>register functions from other server modules</p>
</dd>
</dl>

<a name="module_API"></a>

## API
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

## Usage

```js
var API = require("rf-load").require("rf-api").API

// for read only stuff
API.get('funcName', function(data, res, services) {
    // code to process the request here
});
// for stuff with write access
API.post('funcName', function(data, res, services) {
    // code to process the request here
});
```
Note:
* there are no url parameters used; the correspondig `http Factory` transfers a json objects to the API methods; this obj should include everything
* name your request properly

## PeerDependencies
* `rf-log`
* `rf-load`

## Legal Issues
* License: MIT
* Author: Rapidfacture GmbH

<a name="Request"></a>

## Request
**Kind**: global class  
<a name="new_Request_new"></a>

### new Request()
convert obj structure of original express request

**Example**  
```js
// request structure
{
   session
   token
   user
   rights
   data
   originalRequest
}
```
<a name="Response"></a>

## Response
**Kind**: global class  
<a name="new_Response_new"></a>

### new Response()
middleware for express response; adds error handling

<a name="Services"></a>

## Services
**Kind**: global class  
<a name="new_Services_new"></a>

### new Services()
plug in functions from other modules

<a name="originalResponse"></a>

## originalResponse
**Kind**: global variable  
<a name="Services"></a>

## Services
express response for error handling and sending docs; public to registred functions

**Kind**: global variable  
<a name="new_Services_new"></a>

### new Services()
plug in functions from other modules

<a name="Services"></a>

## Services
public var that holds all registred services

**Kind**: global variable  
<a name="new_Services_new"></a>

### new Services()
plug in functions from other modules

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
//simple
res.error("statusRed");
```
**Example**  
```js
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
```
**Example**  
```js
// respond from db with error handling
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
register functions from other server modules

**Kind**: global function  
**Example**  
```js
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
```
**Example**  
```js
// execute a registred service function
var API = require("rf-load").require("API");

 API.post("get-pdf", function(req, res, services) {
   services.createPdf(req.data, function (pdf){
         var corrected = processPdf(pdf)
         res.send(corrected)
   })
 })
```
