var log = require('rf-log')

var self = {}
var services = {}

self.get = function (name) {
   return (services[name] ? services[name] : null)
}

self.set = function (name, value) {
   services[name] = value
   return self
}

self.registerFunction = function (newFunction) {
   var newFunctionName = newFunction.name
   if (!self[newFunctionName]) {
      self[newFunctionName] = newFunction
   } else {
      log.critical('tried to register function ' + newFunctionName + ' in API, it but already exists.')
   }
}

module.exports = self
