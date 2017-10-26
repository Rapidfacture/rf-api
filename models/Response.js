/*jslint node: true */
'use strict';

/** 
 * Response
 */

 module.exports = function(res) {
   // makes 'this' usable within child functions
   var self = this;

   //The original response
   self.orgRes = res;

   /** 
    * answer.send: default response function
    * adds error handling: req url, stringifies objects for readabilty
    * linearize asynchron code with the successFunction. instead of:
    *
    *   execute function A
    *      then execute function B
    *         afterwards execute function C
    *             afterwards execute function D
    *
    *  the code is linearized:
    *
    *  execute function A
    *
    *  function A
    *     then execute function B
    *
    *  function B
    *     then execute function C
    *
    *  function C
    *     then execute function D
    *
    * advantages: better readabilty, automatic error names for each function
    *
    *
    * @param err: every datatype allowed; sends an error if not 'null';
    * @param data: every datatype allowed; optional
    * @param successFunction: callback function; optional
    * @example
    * answer.send(err, docs, processDocs);
    * function processDocs(docs){
    *   console.log(docs)
    * });
    * @example
    * db.user.groups  // send all groups back to client
    *   .find({})
    *   .exec(answer.send);
    *
    */

   // helper function
   self.send = function(err, docs, status) {
      if (err) {
         status = status || 500;
         if (typeof err == Object) err = JSON.stringify(err);
         self
            .orgRes
            .status(status)
            .send(err)
            .end();
      } else { // success; last step
         status = status || 200;
         self
            .orgRes
            .status(status)
            .send(docs)
            .end();
      }
   };

   /** answer.error: default error function
    * adds req url, stringifies objects for readabilty
    * @param err: every datatype allowed
    * @example
    * answer.errorCustom("statusRed");
    */
   self.error = function(err) {
      if (typeof err == Object) err = JSON.stringify(err);
      self.errorInternal('Server Error: ' + err);
      log.error('Server Error: ' + err);
   };

   /** answer.errorCustom: send custom error string for a special error case
    * can be easy translated in frontend
    * @param err: string
    * @param status: number
    * @example
    * answer.errorCustom("statusRed");
    */
   self.errorCustom = function(err, status) {
      self.send(err, null, status);
      log.error('Error: ' + err);
   };

   /**
    * answer.errorBadRequest: send bad request error string for missing parameters etc.
    * @param err: string
    * @example
    * answer.errorBadRequest("Missing id");
    */
   self.errorBadRequest = function(err) {
      self.send('Bad request: ' + err, null, 400);
   }

   /**
    * answer.errorAuthorizationRequired: send authorization required for protected routes
    * @param err: string
    * @example
    * answer.errorAuthorizationRequired();
    */
   self.errorAuthorizationRequired = function() {
      self.send("Authorization required!", null, 401);
   }

   /**
    * answer.errorAccessDenied: send access denied error if someone is not allowed to get the requested resource
    * @param err: string
    * @example
    * answer.errorAccessDenied("You need admin permissions to access this resource");
    */
   self.errorAccessDenied = function(err) {
      self.send("Access denied: " + err, null, 403);
   }

   /**
    * answer.errorNotFound: send not found error if resource can't be found or route isn't available
    * @param err: string
    * @example
    * answer.errorNotFound("No user found");
    */
   self.errorNotFound = function(err) {
      self.send("Not found: " + err, null, 404);
   }

   /**
    * answer.errorConflict: send conflict response if there is any type of conflict like already exists in database
    * @param err: string
    * @example
    * answer.errorConflict("Already exists in database");
    */
   self.errorConflict = function(err) {
      self.send("Conflict: " + err, null, 409);
   }

   /**
    * answer.errorGone: send gone response if the requested resource doesn't exists anymore. ("User tries to save an entry wich is removed by another customer")
    * @param err: string
    * @example
    * answer.errorGone("User is gone");
    */
   self.errorGone = function(err) {
      self.send(err, null, 410);
   }

   /**
    * answer.errorInternal: send internal server error if error isn't handeled
    * @param err: string
    * @example
    * answer.errorInternal("Database error");
    */
   self.errorInternal = function(err) {
      self.send("Internal Error: " + err, null, 500);
   }

   /** answer.register: register further functions in this API from other server modules
    * @example
    * var answers = require("rf-load").require("API").answers;
    * answers.register(createPdf)
    */
   self.register = function(newFunction) {
      var newFunctionName = newFunction.name;
      if (!self[newFunctionName]) {
         self[newFunctionName] = newFunction;
      } else {
         log.critical("tried to register function " + newFunctionName + " in API, it but already exists.");
      }
   };
};