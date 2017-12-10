/**
 * # Rapidfacture API
 * Express Middleware with plugin system that reduces bad code practices
 *  * shortens code
 *  * prevent forgotten error handling
 *  * uniform error messages
 *  * linearize asynchron code
 *
 * Plugins
 * * [rf-api-mailer](https://www.npmjs.com/package/rf-api-mailer)
 * * [rf-api-thumbnail](https://www.npmjs.com/package/rf-api-thumbnail)
 * * [rf-api-url2pdf](https://www.npmjs.com/package/rf-api-url2pdf)
 *
 * ## Install
 *
 * To install the module:
 *
 * > npm install rf-api
 *
 *
 * ```js
 * var Loader = require('rf-load').moduleLoader
 * var load = new Loader()
 * load.setModulePath(config.paths.modules)
 *
 * // other stuff
 * load.file('db')
 * load.file('http')
 *
 * // start request api
 * load.module('rf-api')
 *
 * // plug in other modules into the api
 * load.module("rf-api-mailer");
 * ```
 *
 */


var log = require('rf-log'),
   app = require('rf-load').require('http').app,
   Request = require('./Request.js'),
   Response = require('./Response.js'),
   Services = require('./Services')


module.exports.API = {

   /**
   * ## Usage
   *
   * Note:
   * * there are no url parameters used; the correspondig `http Factory` transfers a json objects to the API methods; this obj should include everything
   * * name your request properly
   *
   * ```js
   * var API = require("rf-load").require("rf-api").API
   *
   * // for read only stuff
   * API.get('funcName', function(req, res, services) {
   *     // code to process the request here
   * });
   * // for stuff with write access
   * API.post('funcName', function(req, res, services) {
   *     // code to process the request here
   * });
   * ```
   */

   Services: Services,

   get: function (functionName, func, settings) {
      app.get('/' + functionName, function (req, res, next) {
         log.info('GET: ' + functionName)
         func(new Request(req), new Response(res), Services.Services)
      })
   },

   post: function (functionName, func, settings) {
      app.post('/' + functionName, function (req, res, next) {
         log.info('POST: ' + functionName)
         func(new Request(req), new Response(res), Services.Services)
      })
   }

}

module.exports.start = function (options, next) {
   next()
}
