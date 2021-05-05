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
 * var config = require('rf-config').init(__dirname); // config
 * var mongooseMulti = require('mongoose-multi'); // databases
 * var db = mongooseMulti.start(config.db.urls, config.paths.schemas);
 * var http = require('rf-http').start({ // webserver
 *    pathsWebserver: config.paths.webserver,
 *    port: config.port
 * });
 *
 * // prepare api
 * var API = require('rf-api').start({app: http.app}); // needs express app
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
 *       startApi(db, API, services);
 *    });
 * });
 *
 * ```
 *
 */

var fs = require('fs'),
   app = null,
   Request = require('./Request.js'),
   Response = require('./Response.js'),
   Services = require('./Services'),
   config = require('rf-config'),
   os = require('os');


// get internal ip addresses for allowing internal requests
var interfaces = os.networkInterfaces();
var internalIpAddresses = [];
for (var k in interfaces) {
   for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      internalIpAddresses.push(address.address.replace('::ffff:', ''));
   }
}

// logging
var log = {
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

function internalTokenCheck (settings, req) {
   // Check magic token
   let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
   ip = ip.replace('::ffff:', '');

   const internalToken = req.query.internal;
   return settings &&
      settings.internalToken && // this needs to be activated on a per-endpoint basis in settings
      settings.internalToken === internalToken &&
      internalIpAddresses.indexOf(ip) > -1;
}


function getOptions (method) {
   return {
      get: {
         methodPrefix: 'get-',
         log: 'GET',
         httpMethod: 'post'
      },
      realGet: {
         methodPrefix: '',
         log: 'GET',
         httpMethod: 'get'
      },
      post: {
         methodPrefix: 'post-',
         log: 'POST',
         httpMethod: 'post'
      }
   }[method];
}

/**
 * @desc
 * Calls API functions defined in server api files
 *
 * @example
 * // Integration in module.exports.API
 * api(functionName, func, settings, 'post', this);
 *
 *
 * @param functionName Function name defined in API, e.g. 'order-update'
 *
 * @param func Function to be executed, defined in API
 *
 * @param settings Options how to handle endpoint, defined in API
 *
 * @param method String containing 'realGet' / 'get' / 'post' to get settings from getOptions function
 *
 * @param self Object module.exports.API, always called with 'this'
 *
 */
function api (functionName, func, settings, method, self) {
   var options = getOptions(method);
   var endPoint = self.prefix + options.methodPrefix + functionName;

   app[options.httpMethod](endPoint, function (req, res) {
      const internalTokenValid = internalTokenCheck(settings, req);
      // Log request
      if (!settings.logDisabled) {
         log.info(
            options.log + ': ' + functionName +
            (internalTokenValid ? ' (Internal token authenticated)' : '')
         );
      }
      req._isInternal = internalTokenValid;
      req = new Request(req);
      res = new Response(res);

      // Skip ACL if internal token is valid
      if (internalTokenValid) {
         return func(req, res, Services.Services);
      }
      // No internal token => check ACL
      self.checkAcl(settings, req).then(function () {
         func(req, res, Services.Services);
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
}

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

   Services: Services,

   get: function (functionName, func, settings) {
      if (settings.realGet) {
         api(functionName, func, settings, 'realGet', this);

      } else {
         api(functionName, func, settings, 'get', this);
      }
   },

   post: function (functionName, func, settings) {
      api(functionName, func, settings, 'post', this);
   },

   startApiFiles: function (apiPath, callback) {
      try {
         var paths = getDirectoryPaths(apiPath);
         paths.forEach(function (path) {
            var apiStartFunction = require(path).start;
            callback(apiStartFunction);
         });
      } catch (err) {
         log.critical(err);
      }

      function getDirectoryPaths (path) {
         var pathList = [];
         fs.readdirSync(path).forEach(function (file) {
            var filePath = path + '/' + file;
            var stat = fs.statSync(filePath);

            if (stat && stat.isDirectory()) {
               pathList = pathList.concat(getDirectoryPaths(filePath));
            } else if (file[0] !== '.') {
               pathList.push(path + '/' + file.split('.')[0]);
            }
         });
         return pathList;
      }
   },

   checkAcl: (settings, req) => {
      var self = this;
      return new Promise((resolve, reject) => {
         var err = new Error();

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


            // is token valid?
            if (!req.tokenValid) {
               err.code = 401;
               // Check if there is any token for easier debugging
               if (!req.token) {
                  err.message = 'Token missing! Access denied!';
               } else { // there is a token
                  err.message = 'Token expired! Access denied!';
               }
               return reject(err);
            }

            // has user the rights for app?
            if (!req.rights.hasOwnProperty(config.app.name)) {
               err.message = 'No access to this app!';
               err.code = 403;
               return reject(err);
            }

            let rights = req.rights[config.app.name];

            // no section?
            if (!settings.section) {
               err.message = `No section defined for route - protected by default. Access denied!`;
               err.code = 403;
               return reject(err);
            }

            // get section with highest permission
            let right = getHighestRight(settings.section, rights);

            var requiredPermission = (req.originalRequest.method === 'GET' ? 'read' : 'write');
            if (!right.hasOwnProperty(requiredPermission) ||
               right[requiredPermission] === false ||
               right[requiredPermission].length <= 0) {
               err.message = 'Insufficient permissions! Access denied!';
               err.code = 403;
               return reject(err);
            }

            // set admin rights to request for easier checking in the endpoint code
            if (right && right.read && right.read.includes('all')) req.readAdmin = true;
            if (right && right.write && right.write.includes('all')) req.writeAdmin = true;
            req.sectionRights = right;

            resolve();
         }
      });
   }
};

function getHighestRight (section, rights) {
   if (Array.isArray(section)) {

      // we extract the highest read write and the highest write right
      // this may not always be correct (higher read write for one section than for another)
      // still we consider this a simple working solution
      // to avoid problems, endpoints groups have to be split enough
      let highestPerm = {};
      section.forEach(function (secName) {
         if (rights.hasOwnProperty(section)) {
            let right = rights[section];
            var readPermissionVal = getHighetsRightValue(right.read);
            var writePermissionVal = getHighetsRightValue(right.write);
            if (highestPerm.readPermissionVal && highestPerm.readPermissionVal < readPermissionVal) {
               highestPerm.readPermissionVal = readPermissionVal;
               highestPerm.read = section.read;
            }
            if (highestPerm.writePermissionVal && highestPerm.readPermissionVal < writePermissionVal) {
               highestPerm.writePermissionVal = writePermissionVal;
               highestPerm.write = section.write;
            }
         }
      });

      return highestPerm;
   } else {
      return rights[section];
   }

   function getHighetsRightValue (array) {
      var permissionValues = {
         '-': 0,
         'own': 1,
         'account': 2,
         'group': 3,
         'all': 4
      };
      var val = 0;
      array = array || [];
      array.forEach(function (key) {
         if (permissionValues[key] && permissionValues[key] > val) val = permissionValues[key];
      });
      return val;
   }
}



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
