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
   acl: true,

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
            if (e.code === 401) {
               res.errorAuthorizationRequired(
                  `${functionName} not allowed ! ${e.message}`)
            } else {
               res.errorAccessDenied(
                  `${functionName} not allowed! ${e.message}`)
            }
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
            if (e.code === 401) {
               res.errorAuthorizationRequired(
                  `${functionName} token invalid! ${e.message}`)
            } else {
               res.errorAccessDenied(
                  `${functionName} not allowed! ${e.message}`)
            }
         })
      })
   },

   checkAcl: (settings, req) => {
      var self = this
      return new Promise((resolve, reject) => {
         var err = new Error()

         if (!settings || !settings.section) {
            // This is the protection that no one misses to add the protection explicit
            err.message = 'No settings defined! Protected by default'
            err.code = 403
            return reject(err)
         } else {
            // If the settings.permission set but empty the route isn't protected
            if (settings.permission === false || !self.API.acl) {
               return resolve()
            }

            // First check if the token is valid
            if (!req.tokenValid) {
               err.message = 'Access denied! Token expired!'
               err.code = 401
               return reject(err)
            }

            // Check if user has app config rights configured
            if (!req.rights.hasOwnProperty(config.app.name)) {
               err.message = 'Access denied!'
               err.code = 403
               return reject(err)
            }

            var rights = req.rights[config.app.name]

            if (!settings.section) {
              err.message = `Access denied! No section defined for route - protected by default`;
              err.code = 403
              return reject(err)
            } else if (!rights.hasOwnProperty(settings.section)) {
               err.message = `Access denied! Section not found in rights: ${settings.section}`;
               err.code = 403
               return reject(err)
            }

            var requiredPermission = (req.originalRequest.method === 'GET' ? 'read' : 'write')
            if (!rights[settings.section].hasOwnProperty(requiredPermission) ||
               rights[settings.section][requiredPermission] === false ||
               rights[settings.section][requiredPermission].length <= 0) {
               err.message = 'Access denied! Insufficient permissions!'
               err.code = 403
               return reject(err)
            }

            resolve()
         }
      })
   }
}

module.exports.start = function (options, next) {
   next()
}
