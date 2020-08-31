/**
 * get session secret from db
 * acl: check if req route is allowed as express middelware
 * decrypt token an put rights object in req
 */


var jwt = require('jsonwebtoken'),
   async = require('async'),
   NodeCache = require('node-cache'),
   myCache = new NodeCache({
      stdTTL: 10,
      checkperiod: 4
   }),
   config = require('rf-config'),
   _ = require('lodash');


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
   log = require(require.resolve('rf-log')).customPrefixLogger('[rf-api-acl]');
} catch (e) {}


module.exports = {
   /**
    * Verify if a given token is correct in the current context
    */
   verifyToken: function (token, sessionSecret) {
      // Prevent unreadable jwt must be provided
      if (_.isNil(token) || token === '') {
         return Promise.reject(new Error('Token is null, undefined or empty'));
      }
      // Actually process token
      return new Promise((resolve, reject) => {
         jwt.verify(token, sessionSecret, { ignoreExpiration: false }, (err, decoded) => {
            if (err) {
               return reject(err);
            } else {
               return resolve(decoded);
            }
         });
      });
   },

   getSession: function (token, db) {
      return new Promise((resolve, reject) => {
         async.waterfall([
            loadFromCache,
            loadFromDB,
            saveToCache
         ], function (err, session) {
            if (err) {
               reject(err);
            } else {
               resolve(session);
            }
         });

         function loadFromCache (callback) {
            // session with key "token" in cache?
            myCache.get(token, callback);
         }

         function loadFromDB (session, callback) {
            // not in cache => get from db
            if (!session) {
               db.user.sessions
                  .findOne({
                     'token': token
                  })
                  .exec(function (err, session) {
                     if (err || !session) {
                        callback(err || 'No session found!');
                     } else {
                        callback(null, session);
                     }
                  });
            } else {
               callback(null, session);
            }
         }

         function saveToCache (session, callback) {
            // put in cache but do not wait for it
            myCache.set(token, session, function () {});
            callback(null, session);
         }
      });
   },

   checkToken: function (token, acl, sessionSecret, db) {
      // TODO proper implementation
      return module.exports.verifyToken(token, sessionSecret).then(decodedToken => {
         // TODO actually verify something. Currently this will accept in any case
         // NOTE: any exception will reject
         // if(acl.section == ...) {...} else {throw new Exception("Not authorized");}
         return module.exports.getSession(token, db).then(session => {
            return {
               session: session,
               token: token,
               decoded: decodedToken,
               tokenValid: true,
               rights: session.rights,
               user: session.user
            };
         });
      }).catch(err => {
         // If ACL is empty, this is not considered an error
         if (acl.section && acl.permission === false) {
            return {}; // No error, return empty user object
         }
         // Else: This is an error, reject the promise
         throw err;
      });
   },

   getBasicConfig: function (token, db, sessionSecret, options, mainCallback) {
      var loginUrls = config.global.apps['rf-app-erp'].urls;
      var basicInfo = {
         app: config.app,
         loginUrl: loginUrls.main + loginUrls.login,
         loginMainUrl: loginUrls.main,
         termsAndPolicyLink: loginUrls.termsAndPolicyLink
      };

      options = options || {};
      if (options.hasLogin) basicInfo.hasLogin = true;
      // console.log('req.body', req.body);

      if (token) {
         async.waterfall([
            function (callback) {
               module.exports.verifyToken(token, sessionSecret).then(decoded => {
                  callback(null);
               }).catch(err => {
                  // verify error => important; refresh needed
                  log.error(`Bad token: ${err}`);
                  callback(err, basicInfo);
               });
            },
            function (callback) {
               module.exports.getSession(token, db)
                  .then(function (session) {
                     session = session.toObject();

                     delete session.browserInfo; // only interesting for statistic, no need in client
                     delete session.groups; // groups should not be passed
                     delete session.user.groups; // groups should not be passed

                     for (var key in session) {
                        basicInfo[key] = session[key];
                     }
                     // console.log('basicInfo after session get', basicInfo);
                     callback(null, basicInfo);
                  })
                  .catch(function (err) {
                     log.error(err);
                     // ignore if no session is found, still return basicconfig
                     callback(null, basicInfo);
                  });
            }
         ], function (err, session) {
            mainCallback(err, basicInfo);
         });

      } else {
         return mainCallback(null, basicInfo);
      }
   }

};
