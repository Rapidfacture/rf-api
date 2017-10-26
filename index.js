/** 
 * @module API
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

var config = require("rf-config"),
   log = require("rf-log"),
   mongoose = require("mongoose"),
   app = require("rf-load").require("http").app,
   Request = require('./models/Request.js'),
   Response = require('./models/Response.js'),
   ServiceFactory = require("./ServiceFactory"); 


module.exports.API = {

   post: function(functionName, func, settings) {
      app.post('/' + functionName, function( req, res, next ) {
         log.info('POST: ' + functionName);

         req = new Request(req);
         res = new Response(res);

         func(req, res);
      });
   },

   get: function(functionName, func, settings) {
      app.get('/' + functionName, function( req, res, next ) {
         log.info('GET: ' + functionName);

         req = new Request(req);
         res = new Response(res);

         func(req, res);
      });
   },

   put: function(functionName, func, settings) {
      app.put('/' + functionName, function( req, res, next ) {
         log.info('PUT: ' + functionName);

         req = new Request(req);
         res = new Response(res);

         func(req, res);
      });
   },

   ServiceFactory: ServiceFactory

};

module.exports.start = function(options, next) {
   next();
};
