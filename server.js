'use strict';

var express = require('express');
var mongo = require('mongodb');
var request = require('request');

// NOTE: for development
// var test = require('assert');
// NOTE:

var routes = require('./app/routes/index.js');
var app = express();

// get the port and url from the environment
var port = process.env.PORT;
var url = process.env.SHORTY;

// if not set use 3000 as the default
if (port === undefined) {
  port = 3000;
}

// NOTE: for development connect to local db
// url = 'mongodb://localhost:27017/isal'
// NOTE:

mongo.connect(url, function (err, db) {

   if (err) {
      throw new Error('Database failed to connect!');
   } else {
      console.log('Successfully connected to MongoDB on port 27017.');
      // ******************* SEEDING ********************************
       // Check for collection and add a record if none exists
       var clickProjection = { 'date': "", 'search': "" };
       var dbObj = {'date' : new Date(), 'search' : 'dogs'};
       var isal = db.collection('isal');
      //  isal.drop();
       if (isal) {
         console.log('isal found');
         isal.findOne({'search': 'dogs'}, clickProjection, function(err, result){
           if (err) {
             throw err;
           }
           if (result) {
             console.log('Default record found: ');
             console.log(result);
           } else {
             console.log('no data in isal...');
             console.log('adding default record...');
             // add dummy record
             isal.insert(dbObj, function(err, data){
               if (err) {
                 throw err;
               }
               console.log('inserted data: ');
               console.log(data);
             });
           }
         });
       }
       // ******************* END SEED ********************************
   }

   app.use('/public', express.static(process.cwd() + '/public'));
   app.use('/controllers', express.static(process.cwd() + '/app/controllers'));

   routes(app, db);

   app.listen(port, function () {
      console.log('Node.js listening on port: ' + port);
   });

});
