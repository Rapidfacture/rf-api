/**
 * @module API
 *
 * @desc api helper functions
 *
 * Please stick strictly to this API. Thank you :-)
 * The API reduces bad code practices:
 *
 *  * very long code
 *  * forgotten error handling
 *  * nonuniform error messages (dependent on developer)
 *  * linearize asynchron code
 *
 * further functions can be added as plugings
 */


var log = require('rf-log'),
   Request = require('./models/Request.js'),
   Response = require('./models/Response.js'),
   Services = require('./Services'),
   app = require('rf-load').require('http').app


module.exports.API = {

   get: function (functionName, func, settings) {
      app.get('/' + functionName, function (req, res, next) {
         log.info('GET: ' + functionName)

         req = new Request(req)
         res = new Response(res)

         func(req, res)
      })
   },

   post: function (functionName, func, settings) {
      app.post('/' + functionName, function (req, res, next) {
         log.info('POST: ' + functionName)

         req = new Request(req)
         res = new Response(res)

         func(req, res)
      })
   },

   Services: Services

}

module.exports.start = function (options, next) {
   next()
}
