/** @module API
 *
 * @desc api helper functions
 *
 * Please stick strictly to this API. Thank you :-)
 * The API reduces bad code practices:
 *
 *  * very long code
 *  * forgotten error handling
 *  * nonuniform error messages (dependent on developer)
 *  * linearize asynchron code
 *
 * the answer function has following methods:
 *  _response
 *  _request
 *  _session
 *  reqUrl
 *  send
 *  sendDocsRequired
 *  error
 *  errorCustom
 *  ObjectId
 *
 * further functions can be added as plugings
 */

/* jshint node: true */
"use strict";

var mongoose = require("mongoose"),
    app = require("rf-load").require("http").app;


module.exports.API = {

   post: function(functionName, func, settings) {
      app.post('/' + functionName,
         function(req, res, next) {
            log.info(functionName);

            //console.log(req.body);
            var data = req.body.data || {};



            if (req.session) {
               data._rights = req.session.rights[config.app.name];
               data._groups = req.session.groups;

               if (settings) {
                  // req not allowed?
                  // res.status(404)
                  // return
               }
            }

            // console.log(req.session, req.decoded);

            var answer = new module.exports.answers(res, functionName);
            delete answer.register; // should only be used on app start, not in requests
            answer._request = req; // put in answer (always an object)

            func(data, answer);

         });
   },

   get: function(functionName, func, settings) {
      app.get('/' + functionName, function(req, res, next) {
         log.info('GET: ' + functionName);
         var data = JSON.parse(Buffer.from(req.query.data, 'base64').toString());

         var answer = new module.exports.answers(res, functionName);
         delete answer.register;
         answer._request = req;

         func(data, answer);
      });
   },

    put: function(functionName, func, settings) {
      app.put('/' + functionName, function(req, res, next) {
        log.info(functionName);
        if (!settingsCheck(settings)) {
           return;
        }

        var answer = new module.exports.answers(res, functionName);
        delete answer.register;
        answer._request = req;

        func(data, answer);
      });
    },

   registerAnswerFunction: function(newFunction){
      var newFunctionName = newFunction.name;
      var self = module.exports.answers;
      if (!self[newFunctionName]) {
         self.prototype[newFunctionName] = newFunction;
      } else {
         log.critical("tried to register function " + newFunctionName + " in API, it but already exists.");
      }
   }

};


/** request answer function
 * a to the request configured instance is overgiven
 * @example
 *   API.post('groups', function(data, answer) {
 *         answer.send(null, "it worked"); // use the answer function here
 *    });
 */
module.exports.answers = function(res, urlRequestName) {

   // makes 'this' usable within child functions
   var self = this;

   // also return original request, if headers or body would be needed
   self._response = res;

   // for good error handling: tell the
   self.reqUrl = urlRequestName;


   /** answer.send: default response function
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
   self.send = function(err, docs, successFunction) {
      self.handleSendError(err, docs, successFunction);
   };

   //

   /** answer.sendDocsRequired: same as "send", but error, when no docs found
    * @example
    * answer.send(err, docs, function processDocs(docs){
    *   console.log(docs)
    * });
    * @example
    * db.user.groups  // send all groups back to client
    *   .find({})
    *   .exec(answer.send);
    */
   self.sendDocsRequired = function(err, docs, successFunction) {
      self.handleSendError(err, docs, successFunction, true);
   };


   /** answer.error: default error function
    * adds req url, stringifies objects for readabilty
    * @param err: every datatype allowed
    * @example
    * answer.errorCustom("statusRed");
    */
   self.error = function(err) {
      if (typeof err == Object) err = JSON.stringify(err);
      self._response.status(404).send('Server Error, function ' + self.reqUrl + ': ' + err).end();
      log.error(' function ' + self.reqUrl + ': ' + err);
   };



   /** answer.errorCustom: send custom error string for a special error case
    * can be easy translated in frontend
    * @param err: string
    * @example
    * answer.errorCustom("statusRed");
    */
   self.errorCustom = function(err) {
      self._response.status(404).send(err).end();
      log.error(' function ' + self.reqUrl + ': ' + err);
   };

   /**
    * answer.errorBadRequest: send bad request error string for missing parameters etc.
    * @param err: string
    * @example
    * answer.errorBadRequest("Missing id");
    */
   self.errorBadRequest = function(err) {
      self.handleSendError(err, null, null, false, 400);
   }

   /**
    * answer.errorAuthorizationRequired: send authorization required for protected routes
    * @param err: string
    * @example
    * answer.errorAuthorizationRequired();
    */
   self.errorAuthorizationRequired = function() {
      self.handleSendError("Authorization required!", null, null, false, 401);
   }

   /**
    * answer.errorAccessDenied: send access denied error if someone is not allowed to get the requested resource
    * @param err: string
    * @example
    * answer.errorAccessDenied("You need admin permissions to access this resource");
    */
   self.errorAccessDenied = function(err) {
      self.handleSendError("Access denied: " + err, null, null, false, 403);
   }

   /**
    * answer.errorNotFound: send not found error if resource can't be found or route isn't available
    * @param err: string
    * @example
    * answer.errorNotFound("No user found");
    */
   self.errorNotFound = function(err) {
      self.handleSendError("Not found: " + err, null, null, false, 404);
   }

   /**
    * answer.errorConflict: send conflict response if there is any type of conflict like already exists in database
    * @param err: string
    * @example
    * answer.errorConflict("Already exists in database");
    */
   self.errorConflict = function(err) {
      self.handleSendError("Conflict: " + err, null, null, false, 409);
   }

   /**
    * answer.errorGone: send gone response if the requested resource doesn't exists anymore. ("User tries to save an entry wich is removed by another customer")
    * @param err: string
    * @example
    * answer.errorGone("User is gone");
    */
   self.errorGone = function(err) {
      self.handleSendError(err, null, null, false, 410);
   }


   /** answer.ObjectId: create new object id
    * needed when mongoose "upsert" shoud create a new doc
    * @example
    * data._id = data._id  || answer.ObjectId();
    */
   self.ObjectId = mongoose.Types.ObjectId;



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

   // helper function
   self.handleSendError = function(err, docs, successFunction, docsRequired, code) {
      if (err) {
         code = code || 404;
         if (typeof err == Object) err = JSON.stringify(err);
         if (successFunction) {
            self._response.status(404).send('Server Error, request url ' + self.reqUrl + ', function ' + successFunction.name + ': ' + err).end();
            return;
         } else {
            self._response.status(404).send('Server Error, request url ' + self.reqUrl + ': ' + err).end();
            return;
         }
      } else if (docsRequired && docs === null) {
         code = code || 404;
         self._response.status(404).send('noDocumentFoundInDb').end();
      } else if (successFunction) { // processing continues => execute when everything fine
         successFunction(docs);
      } else { // success; last step
         code = code || 200;
         self._response.status(code).send(docs).end();
      }
   }
};

module.exports.start = function(options, next) {
   next();
};

