/**
 * ## res
 * Middleware for express response; adds error handling.
 * The original express respones is also passed as `res.originalResponse`
 */


var log = require('rf-log');
var db

module.exports = function (res, database) {
   db = database;

   // makes 'this' usable within child functions
   var self = this;
   self.originalResponse = res;


   /** ### res.send()
   *
   * default response function; adds error handling
   *
   * Example: Simple
   * ```js
   * res.send(err, data);
   * ```
   *
   * Example: respond from db with error handling
   * ```js
   * db.user.groups  // send all groups back to client
   *   .find({})
   *   .exec(res.send);
   * ```
   *
   * Example: using the callback function
   * ```js
   * createDocs()
   *
   * function createDocs(){
   *   createDoc(function (err, doc){
   *     res.send(err, docs, processDocs);
   *   })
   * }
   *
   * function processDocs(){
   *   console.log(docs)
   *   res.send(err, docs);
   * }
   *  // linearize asynchron code with the successFunction. instead of:
   *  //
   *  //   execute function A
   *  //     then execute function B
   *  //        afterwards execute function C
   *  //           afterwards execute function D
   *  //
   *  // the code is linearized:
   *  //
   *  // execute function A
   *  //
   *  // function A
   *  //    then execute function B
   *  //
   *  // function B
   *  //     then execute function C
   *  //
   *  // function C
   *  //   then execute function D
   *  //
   *  // advantages: better readabilty, automatic error names for each function
   *  ```
   */
   self.send = function (err, docs, callback) {
      if (!err && callback && typeof (callback) === 'function') {
         callback(docs);
      } else {
         send(err, docs, res);
      }
   };


   /** ### res.errors
     * Send back error with specific error code
     *  ```js
     * res.error("statusRed")
     * // status 500; standard error; if error isn't handeled
     * ```
     */
   self.error = function (err) {
      handleError(err, function (result) {
         send('Server Error: ' + result, null, res, 500);
         log.error('Server Error: ' + result);
      });
   };


   /** ```js
     * res.errorBadRequest("Missing id")
     * // status 400; missing or wrong parameters
     * ```
     */
   self.errorBadRequest = function (err) {
      send('Bad request: ' + err, null, res, 400);
   };


   /** ```js
    * res.errorAuthorizationRequired()
    * // status 401; not autorized for route
    * ```
    */
   self.errorAuthorizationRequired = function (msg) {
      send(`Authorization required! ${msg || ''}`, null, res, 401);
   };


   /** ```js
    * res.errorAccessDenied("You need be admin")
    * // status 403; request not allowed for user
    * ```
    */
   self.errorAccessDenied = function (err) {
      send('Access denied: ' + err, null, res, 403);
   };


   /** ```js
    * res.errorNotFound("No user found")
    * // status 404; not found or not available
    * ```
    */
   self.errorNotFound = function (err) {
      send('Not found: ' + err, null, res, 404);
   };


   /** ```js
    * res.errorAlreadyExists("User exists")
    * // status 409
    * ```
    */
   self.errorAlreadyExists = function (err) {
      send('Already Exists: ' + err, null, res, 409);
   };

   /** ```js
    * res.errorNoLongerExists("User is gone")
    * // status 410; tried to save an entry wich was removed?
    * ```
    */
   self.errorNoLongerExists = function (err) {
      send(err, null, res, 410);
   };
};


/* -------------- helper functions ----------------- */


function send (err, docs, res, status) {
// handle requests
   if (err) {
      status = status || 500;
      handleError(err, function (result) {
         res
            .status(status)
            .send(result)
            .end();
      });

   } else { // success; last step
      status = status || 200;
      res
         .status(status)
         .json(docs)
         .end();
   }
}



function handleError (error, callback) {
   var endPoint, stack, type;
   if (typeof error === 'object') {
      if (error.endPoint) endPoint = error.endPoint;

      // MongoDB Unique Error
      if (error.code === 11000) {
         error = error.errmsg;

      } else if (error.message && error.stack) {
         var errStack = error.stack.split('\n');

         type = errStack[0];
         stack = errStack.slice(1);
         error = 'Error: ' + error.message;

      } else {
         error = JSON.stringify(error);
      }
   }

   if (!endPoint) return callback(error);

   db.statistic.endPoints
      .findOneAndUpdate(
         { name: endPoint.name, method: endPoint.method },
         { $push: {
            events: {
               stack: stack,
               eventType: type,
               date: new Date(),
               data: endPoint.data
            }
         } },
         { upsert: true, new: true },
         function (err) {
            if (err) console.log('Error while saving error in statistic', err);

            callback(error);
         }
      );
}
