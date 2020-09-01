/**
 * ## res
 * Middleware for express response; adds error handling.
 * The original express respones is also passed as `res.originalResponse`
 */


module.exports = function (res) {
   // makes 'this' usable within child functions
   let self = this;

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

   // integrate errors
   let errors = require('errors').getErrors(function (err, status) {
      send(err, null, res, status);
   });
   for (var errorName in errors) {
      self[errorName] = errors[errorName];
   }

};


/* -------------- helper functions ----------------- */


function send (err, docs, res, status) {
// handle requests
   if (err) {
      status = status || 500;
      err = handleError(err);

      res
         .status(status)
         .send(err)
         .end();
   } else { // success; last step
      status = status || 200;
      res
         .status(status)
         .json(docs)
         .end();
   }
}



function handleError (err) {
// return the required error string for the response

   if (typeof err === 'object') {
      // MongoDB Unique Error
      if (err.code === 11000) return err.errmsg;
      // else
      return JSON.stringify(err);
   }

   return err;
}
