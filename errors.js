/**
 * ## res
 * Middleware for express response; adds error handling.
 * The original express respones is also passed as `res.originalResponse`
 */


var log = require('rf-log');



function getErrors (send) {
   return {
      /** ### res.errors
        * Send back error with specific error code
        *  ```js
        * res.error("statusRed")
        * // status 500; standard error; if error isn't handeled
        * ```
        */
      error: function (err) {
         send('Server Error: ' + err, 500);
         log.error('Server Error: ' + err);
      },


      /** ```js
        * res.errorBadRequest("Missing id")
        * // status 400; missing or wrong parameters
        * ```
        */
      errorBadRequest: function (err) {
         send('Bad request: ' + err, 400);
      },


      /** ```js
       * res.errorAuthorizationRequired()
       * // status 401; not autorized for route
       * ```
       */
      errorAuthorizationRequired: function (err) {
         send(`Authorization required! ${err || ''}`, 401);
      },


      /** ```js
       * res.errorAccessDenied("You need be admin")
       * // status 403; request not allowed for user
       * ```
       */
      errorAccessDenied: function (err) {
         send('Access denied: ' + err, 403);
      },


      /** ```js
       * res.errorNotFound("No user found")
       * // status 404; not found or not available
       * ```
       */
      errorNotFound: function (err) {
         send('Not found: ' + err, 404);
      },


      /** ```js
       * res.errorAlreadyExists("User exists")
       * // status 409
       * ```
       */
      errorAlreadyExists: function (err) {
         send('Already Exists: ' + err, 409);
      },

      /** ```js
       * res.errorNoLongerExists("User is gone")
       * // status 410; tried to save an entry wich was removed?
       * ```
       */
      errorNoLongerExists: function (err) {
         send(err, 410);
      }
   };
}



module.exports = {
   getErrors
};
