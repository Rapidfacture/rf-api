/*jslint node: true */
'use strict';

/** 
 * Request
 */
module.exports = function(req) {
   var self = this;
   
   // Original Request
   self.originalRequest = req;
   
   // Set session if available
   self.session = req._session || null;

   // Set token if available
   self.token = req._token || null;
   
   self.user = null;
   self.rights = null;

   if (self.session) {
      self.user = self.session.user;
      self.rights = self.session.rights;
   }

   self.data = {};

   // Decode data depending on the request method
   if (req.method === "POST") {
      self.data = req.body.data || {};
   } else if (req.method) {
      //Decode data to get a data body
      self.data = (req.query.data ? JSON.parse(Buffer.from(req.query.data, 'base64').toString()) : {});
   }

};