/**
 * ## req
 * convert obj structure of original express request
 * ```js
 * {
 *   session            // extracted from rf-acl
 *   token              // extracted from rf-acl
 *   user               // extracted from rf-acl
 *   rights             // extracted from rf-acl
 *   data               // data from client
 *   originalRequest    // express req
 * }
 * ```
 */

var log = require('rf-log')

module.exports = function (req) {
   var self = this

   // Original Request
   self.originalRequest = req

   // Set session if available
   self.session = req._session || null

   // Set token if available
   self.token = req._token || null

   self.user = null
   self.rights = null

   if (self.session) {
      self.user = self.session.user
      self.rights = self.session.rights
   }

   self.data = {}

   // Decode data depending on the request method
   if (req.method === 'POST') {
      self.data = req.body.data || {}
   } else if (req.method) {
      // Decode data to get a data body
      var decoded = {}

      try {
         decoded = req.query.data
         decoded = Buffer.from(decoded, 'base64')
         decoded = decoded.toString()
      } catch (e) {
         log.error(e)
      }

      self.data = decoded
   }
}
