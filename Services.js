/**
  * ## services
  * provide plugged in functions from other rf-api-* modules
  */


var log = require('rf-log');

module.exports = {
   // public var that holds all registred services
   Services: {},


   /** ### Register functions
    * Example: use the services
    * ```js
    * var API = require("rf-load").require("API");
    *
    *  API.post("get-pdf", function(req, res, services) {
    *    services.createPdf(req.data, function (pdf){
    *          var corrected = processPdf(pdf)
    *          res.send(corrected)
    *    })
    *  })
    * ```
    * Example: register functions from other server modules
    * ```js
    * var Services = require("rf-load").require("API").Services;
    * function createPdf(url, callback){
    *   createdPdfDoc(url, function(err, pdf){
    *       // callback always has the parameters mongoose like: err, docs
    *       callback(err, pdf)
    *   })
    * }
    * Services.register(createPdf)
    * ```
    */
   registerFunction: function (newFunction) {
      var self = this;
      var newFunctionName = newFunction.name;
      if (!self.Services[newFunctionName]) {
         self.Services[newFunctionName] = newFunction;
      } else {
         log.critical('tried to register function ' + newFunctionName + ' in API, it but already exists.');
      }
   }
};



/**
*
* ## PeerDependencies
* * `rf-log`
* * `rf-load`
*
* ## Development
*
* Install the dev tools with
> npm install
*
* Then you can runs some test cases and eslint with:
*> npm test
*
* Generate Docs:
* > npm run-script doc
*
* ## To Do
* * testing
* * create a grunt task for mdextract
* ## Legal Issues
* * License: MIT
* * Author: Rapidfacture GmbH
*/
