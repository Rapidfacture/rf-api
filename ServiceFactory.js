/* jshint node: true */
"use strict";

var log = require("rf-log");

module.exports.start = function(options, next) {

   var self = this;
   self.services = {};
   
   self.get = function(name) {
      return (self.services[name] ? self.services[name] : null);
   };

   self.set = function(name, value) {
      self.services[name] = value;
      return self;
   };

   self.registerFunction = function(newFunction){
      var newFunctionName = newFunction.name;
      if (!self[newFunctionName]) {
         self.prototype[newFunctionName] = newFunction;
      } else {
         log.critical("tried to register function " + newFunctionName + " in API, it but already exists.");
      }
   };

   next();
};