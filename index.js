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
 *
 * // prepare backend
 * let config = require('rf-config').init(__dirname); // config
 * let mongooseMulti = require('mongoose-multi'); // databases
 * let db = mongooseMulti.start(config.db.urls, config.paths.schemas);
 * let http = require('rf-http').start({ // webserver
 *    pathsWebserver: config.paths.webserver,
 *    port: config.port
 * });
 *
 * // prepare api
 * let API = require('rf-api').start({app: http.app}); // needs express app
 *
 * db.global.mongooseConnection.once('open', function () {
 *    // optional: start access control; has to be done before starting the websocket
 *    require('rf-acl').start({
 *       API: API,
 *       db: db,
 *       app: http.app,
 *       sessionSecret: dbSettings.sessionSecret.value
 *    });
 *
 *    // start requests
 *    API.startApiFiles(config.paths.apis, function (startApi) {
 *       startApi(db, API);
 *    });
 * });
 *
 * ```
 *
 */

let fs = require('fs');
let app = null;
let Request = require('./Request.js');
let Response = require('./Response.js');
let config = require('rf-config');
let os = require('os');


// get internal ip addresses for allowing internal requests
let interfaces = os.networkInterfaces();
let internalIpAddresses = [];
for (let k in interfaces) {
   for (let k2 in interfaces[k]) {
      let address = interfaces[k][k2];
      internalIpAddresses.push(address.address.replace('::ffff:', ''));
   }
}

// logging
let log = {
   info: console.log,
   success: console.log,
   error: console.error,
   critical: function () {
      throw new Error(console.error.apply(arguments));
   }
};
try { // try using rf-log
   log = require(require.resolve('rf-log')).customPrefixLogger('[rf-api]');
} catch (e) {}


module.exports.API = {
   /**
   *
   * ## Usage
   *
   * Note:
   * * there are no url parameters used; the correspondig `http Factory` transfers a json objects to the API methods; this obj should include everything
   * * name your request properly
   *
   * ```js
   * // for read only stuff
   * API.get('funcName', function(req, res) {
   *     // code to process the request here
   * });
   * // for stuff with write access
   * API.post('funcName', function(req, res) {
   *     // code to process the request here
   * });
   * ```
   */
   acl: true,

   prefix: '/api/',

   get: function (functionName, func, settings) {
      let self = this;
      app.get(this.prefix + functionName, function (req, res, next) {
         // Check magic token
         let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
         ip = ip.replace('::ffff:', '');
         // console.log('ip', ip);
         const internalToken = req.query.internal;
         const internalTokenValid =
            settings &&
            settings.internalToken && // this needs to be activated on a per-endpoint basis in settings
            settings.internalToken === internalToken &&
            internalIpAddresses.indexOf(ip) > -1;
         // Log request
         if (!settings.logDisabled) {
            log.info(
               'GET: ' + functionName +
                (internalTokenValid ? ' (Internal token authenticated)' : '')
            );
         }
         req._isInternal = internalTokenValid;
         req = new Request(req);
         res = new Response(res);
         // Skip ACL if internal token is valid
         if (internalTokenValid) {
            return func(req, res);
         }
         // No internal token => check ACL
         self.checkAcl(settings, req).then(function () {
            func(req, res);
         }).catch(function (e) {
            if (e.code === 401) {
               res.errorAuthorizationRequired(
                  `${functionName} not allowed ! ${e.message}`);
            } else {
               res.errorAccessDenied(
                  `${functionName} not allowed! ${e.message}`);
            }
         });
      });
   },

   post: function (functionName, func, settings) {
      let self = this;
      app.post(this.prefix + functionName, function (req, res, next) {
         if (!settings.logDisabled) {
            log.info('POST: ' + functionName);
         }
         req = new Request(req);
         res = new Response(res);
         self.checkAcl(settings, req).then(function () {
            func(req, res);
         }).catch(function (e) {
            if (e.code === 401) {
               res.errorAuthorizationRequired(
                  `${functionName} token invalid! ${e.message}`);
            } else {
               res.errorAccessDenied(
                  `${functionName} not allowed! ${e.message}`);
            }
         });
      });
   },

   checkAcl: (settings, req) => {
      let self = this;
      return new Promise((resolve, reject) => {
         let err = new Error();

         if (!settings || !settings.section) {
            // This is the protection that no one misses to add the protection explicit
            err.message = 'No settings defined! Protected by default';
            err.code = 403;
            return reject(err);
         } else {
            // If the settings.permission set but empty the route isn't protected
            if (settings.permission === false || !self.API.acl) {
               return resolve();
            }



            // First check if the token is valid
            if (!req.tokenValid) {
               err.code = 401;
               // Check if there is any token for easier debugging
               if (!req.token) {
                  err.message = 'Access denied! Token missing!';
               } else { // there is a token
                  err.message = 'Access denied! Token expired!';
               }
               return reject(err);
            }

            // Check if user has app config rights configured
            if (!req.rights.hasOwnProperty(config.app.name)) {
               err.message = 'Access denied!';
               err.code = 403;
               return reject(err);
            }

            let rights = req.rights[config.app.name];

            if (!settings.section) {
               err.message = `Access denied! No section defined for route - protected by default`;
               err.code = 403;
               return reject(err);
            } else if (!rights.hasOwnProperty(settings.section)) {
               err.message = `Access denied! Section not found in rights: ${settings.section}`;
               err.code = 403;
               return reject(err);
            } else { // set section rights to request
               req.sectionRights = rights[settings.section];

               if (req.sectionRights && req.sectionRights.read && req.sectionRights.read.includes('all')) {
                  req.readAdmin = true;
               }
               if (req.sectionRights && req.sectionRights.write && req.sectionRights.write.includes('all')) {
                  req.writeAdmin = true;
               }
            }

            let requiredPermission = (req.originalRequest.method === 'GET' ? 'read' : 'write');
            if (!rights[settings.section].hasOwnProperty(requiredPermission) ||
               rights[settings.section][requiredPermission] === false ||
               rights[settings.section][requiredPermission].length <= 0) {
               err.message = 'Access denied! Insufficient permissions!';
               err.code = 403;
               return reject(err);
            }

            resolve();
         }
      });
   },

   //
   //  API.startApiFiles(config.paths.apis, function(startApi){
   //    startApi(db, API);
   //  })
   //
   startApiFiles: function (apiPath, callback) {
      try {
         let paths = getDirectoryPaths(apiPath);
         paths.forEach(function (path) {
            let apiStartFunction = require(path).start;
            callback(apiStartFunction);
         });
      } catch (err) {
         log.critical(err);
      }

      function getDirectoryPaths (path) {
         let pathList = [];
         fs.readdirSync(path).forEach(function (file) {
            let filePath = path + '/' + file;
            let stat = fs.statSync(filePath);

            if (stat && stat.isDirectory()) {
               pathList = pathList.concat(getDirectoryPaths(filePath));
            } else if (file[0] !== '.') {
               pathList.push(path + '/' + file.split('.')[0]);
            }
         });
         return pathList;
      }
   }



};

module.exports.start = function (options, next) {

   if (!options.app) log.critical('"app" is undefined. An expres app instance is needed!');

   app = options.app;


   // endpoint to check server availability
   app.post('/server-health-check', function (req, res) {
      let isValidRequest = !!(req.body.data && req.body.data === 'requesting health check');
      if (isValidRequest) {
         res.send('health check ok');
      } else {
         console.log(req.body.data);
         res.status(500).send('Error: req.body.data seems incorrect');
      }
   });

   if (next) next();
   return module.exports.API;
};
