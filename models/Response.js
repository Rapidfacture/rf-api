// @module Response
// @desc middleware for express response; adds error handling
var log = require('rf-log')


module.exports = function (res) {
   // makes 'this' usable within child functions
   var self = this


   /** @var originalResponse pass original express response
   */
   self.originalResponse = res


   /** @function send
   * @desc  default response function; adds error handling
   * @param err every datatype allowed; sends an error if not 'null';
   * @param data every datatype allowed; optional
   * @param successFunction callback function; optional
   * @example simple
   * res.error("statusRed");
   * @example with callback
   * res.send(err, docs, processDocs);
   * function processDocs(docs){
   *   console.log(docs)
   * });
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
   * @example respond from db with error handling
   * db.user.groups  // send all groups back to client
   *   .find({})
   *   .exec(res.send);
   */
   self.send = function (err, docs, callback) {
      if (!err && callback) {
         callback(docs)
      } else {
         send(err, docs)
      }
   }


   /** @function error
    * @desc  default error
    * @param err every datatype allowed
    * @example res.error("statusRed");
    */
   self.error = function (err) {
      err = handleError(err)
      self.errorInternal('Server Error: ' + err)
      log.error('Server Error: ' + err)
   }


   /** @function errorInternal
    * @desc  if error isn't handeled
    * @param err string
    * @example res.errorInternal("Database error");
    */
   self.errorInternal = function (err) {
      send('Internal Error: ' + err, null, res, 500)
   }


   /** @function errorBadRequest
    * @desc missing or wrong parameters
    * @param err string
    * @example res.errorBadRequest("Missing id");
    */
   self.errorBadRequest = function (err) {
      send('Bad request: ' + err, null, res, 400)
   }


   /** @function errorAuthorizationRequired
    * @desc  not autorized for route
    * @param err string
    * @example res.errorAuthorizationRequired();
    */
   self.errorAuthorizationRequired = function () {
      send('Authorization required!', null, res, 401)
   }


   /** @function errorAccessDenied
    * @desc request not allowed for user
    * @param err string
    * @example res.errorAccessDenied("You need be admin");
    */
   self.errorAccessDenied = function (err) {
      send('Access denied: ' + err, null, res, 403)
   }


   /** @function errorNotFound
    * @desc not found or not available
    * @param err string
    * @example res.errorNotFound("No user found");
    */
   self.errorNotFound = function (err) {
      send('Not found: ' + err, null, res, 404)
   }


   /** @function errorAlreadyExists
    * @param err string
    * @example res.errorAlreadyExists();
    */
   self.errorAlreadyExists = function (err) {
      send('Already Exists: ' + err, null, res, 409)
   }

   /**
    * @function errorNoLongerExists
    * @desc tried to save an entry wich was removed
    * @param err string
    * @example
    * res.errorNoLongerExists("User is gone");
    */
   self.errorNoLongerExists = function (err) {
      send(err, null, res, 410)
   }


   /** @function register
    * @desc  register further functions from other server modules
    * @example
    * var Requests = require("rf-load").require("API").Requests;
    * Requests.register(createPdf)
    */
   self.register = function (newFunction) {
      var newFunctionName = newFunction.name
      if (!self[newFunctionName]) {
         self[newFunctionName] = newFunction
      } else {
         log.critical('tried to register function ' + newFunctionName + ' in API, it but already exists.')
      }
   }
}


/* -------------- helper functions ----------------- */


function send (err, docs, res, status) {
// handle requests
   if (err) {
      status = status || 500
      err = handleError(err)

      res
         .status(status)
         .send(err)
         .end()
   } else { // success; last step
      status = status || 200
      res
         .status(status)
         .json(docs)
         .end()
   }
}



function handleError (err) {
// return the required error string for the response

   if (typeof err === 'object') {
      // MongoDB Unique Error
      if (err.code === 11000) return err.errmsg
      // else
      return JSON.stringify(err)
   }

   return err
}
