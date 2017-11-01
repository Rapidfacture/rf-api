/**
  * # Services
  * plug in functions from other modules
  */


var log = require('rf-log')
var _Services = {}


module.exports = function (res) {
   var self = this

   /** @var res
    * @desc express response for error handling and sending docs; public to registred functions
    */
   self.res = res

   /** @var Services
    * @desc public var that holds all registred services
    */
   self.Services = _Services


   /**
    * function: register functions from other server modules
    * @example
    * // register a function
    * var Services = require("rf-load").require("API").Services;
    * function createPdf(url, callback){
    *   var res = this.res // get response from parent service
    *   createdPdfDoc(url, function(err, pdf){
    *       if(err){
    *          res.error(err)
    *       }else{
    *          callback(pdf)
    *       }
    *   })
    * }
    * Services.register(createPdf)
    *
    * @example
    * // execute a registred service function
    * var API = require("rf-load").require("API");
    *
    *  API.post("get-pdf", function(req, res, services) {
    *    services.createPdf(req.data, function (pdf){
    *          var corrected = processPdf(pdf)
    *          res.send(corrected)
    *    })
    *  })
    *
    */
   self.registerFunction = function (newFunction) {
      var newFunctionName = newFunction.name
      if (!_Services[newFunctionName]) {
         _Services[newFunctionName] = newFunction
      } else {
         log.critical('tried to register function ' + newFunctionName + ' in API, it but already exists.')
      }
   }
}
