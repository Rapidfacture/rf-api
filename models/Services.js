var log = require('rf-log')

var self = {}

self.registerFunction = function (newFunction) {
   var newFunctionName = newFunction.name
   if (!self[newFunctionName]) {
      self[newFunctionName] = newFunction
   } else {
      log.critical('tried to register function ' + newFunctionName + ' in API, it but already exists.')
   }
}

module.exports = self
