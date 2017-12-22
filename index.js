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
   Services = require('./Services'),
   config = require('rf-config')

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
      var self = this
      app.get('/' + functionName, function (req, res, next) {
         log.info('GET: ' + functionName)
         req = new Request(req)
         res = new Response(res)
         self.checkAcl(settings, req).then(function () {
            func(req, res, Services.Services)
         }).catch(function (e) {
            res.errorAccessDenied(functionName + ' not allowed!')
         })
      })
   },

   post: function (functionName, func, settings) {
      var self = this
      app.post('/' + functionName, function (req, res, next) {
         log.info('POST: ' + functionName)
         req = new Request(req)
         res = new Response(res)
         self.checkAcl(settings, req).then(function () {
            func(req, res, Services.Services)
         }).catch(function (e) {
            res.errorAccessDenied(functionName + ' not allowed!')
         })
      })
   },

   checkAcl: (settings, req) => {
      return new Promise((resolve, reject) => {
         if (!settings || !settings.section) {
            // This is the protection that no one misses to add the protection explicit
            return reject(new Error('No settings defined! Protected by default'))
         } else {
            // If the settings.permission set but empty the route isn't protected
            if (settings.permission === false) {
               return resolve()
            }

            // Check if user has app config rights configured
            if (!req.rights.hasOwnProperty(config.app.name)) {
               return reject(new Error('Access denied'))
            }

            var rights = req.rights[config.app.name]

            if (!rights.hasOwnProperty(settings.section)) {
               return reject(new Error('No section defined for route! Protected by default'))
            }

            if (!rights[settings.section].hasOwnProperty(settings.permission) ||
               rights[settings.section][settings.permission] === false ||
               rights[settings.section][settings.permission].length <= 0) {
               return reject(new Error('Access denied! Insufficient permissions!'))
            }

            if (!req.tokenValid) {
               return reject(new Error('Access denied! Token expired!'))
            }

            resolve()
         }
      })
   }
}

module.exports.start = function (options, next) {
   next()
}
