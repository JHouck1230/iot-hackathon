"use strict";

var fs = require("fs");
var path = require("path");
var request = require("request");
var http = require('http');
var async = require('async');
// var tropo_webapi = require('tropo-webapi');

var config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"))
);

var temp = new (require("jsupm_grove").GroveTemp)(3);
var events = new (require("events").EventEmitter)();
var message = '';
var firstTimer, secondTimer, tempInterval;

function monitorTemperature() {
  var prev = 0;
  tempInterval = setInterval(function() {
    var temperatureC = temp.value();
    var temperatureF = (temperatureC * (9 / 5)) + 32;

    console.log("current temp: " + temperatureF);
    if (temperatureF >= 0) {
      // console.log('message: ', message);
        message = 'Current temperature in your vehicle is ' + temperatureF + '. Please return to vehicle IMMEIDATELY to protect occupants from suffering from HEATSTROKE or DEATH! Reply "OK" to acknowledge.';
        events.emit("alert-owner" + temperatureF + message);
      }
        firstTimer = setTimeout(function(){
          message = 'Current temperature in your vehicle is ' + temperatureF +'! Emergency services will be contacted in 2 minutes if acknowledgement is not received. Reply "HELP" to contact emergency services now OR reply "OK" to prevent emergency services from being contacted.';
          events.emit("alert-owner" + temperatureF + message);
        },12000);
      }
        secondTimer = setTimeout(function(){
          message = 'Current temperature in you vehicle is ' + temperatureF +'! Emergency services have been contacted with will arrive at your vehicle shortly!';
          events.emit("contact-emergency-services");
          events.emit("alert-owner" + temperatureF + message);
        },12000);
      }

    }
    prev = temperatureF;
  }, 500);
}

events.once('contact-emergency-services', function() {
  var lat = 37.4047,
      lng = -121.9752;
  getPBData(lat, lng, function(err, geoData) {
    
  })


    console.log('geo911 response phone number: ' + res.phone);
  // tropo to contact emergency service



  console.log('emergency services contacted');
  gotReply();
  // request.get('https://ie-parking.run.aws-usw02-pr.ice.predix.io/v1/locations/')
})



function getPBData(lat, lng, cb) {
  async.parallel([
    function(callback){
      request.get('https://api.pitneybowes.com/location-intelligence/geo911/v1/psap/bylocation?latitude=' + lat + '&longitude=' + lng, function(req, res, err) {
        console.log('geo911 response phone number: ' + res.phone);
        callback(null, res);
      })
    },
    function(callback){
      request.get('https://api.pitneybowes.com/location-intelligence/geocode-service/b1/transient/premium/reverseGeocode?y=' + lat + '&x=' + lng + '&coordSysName=EPSG:4326&distance=1500&distanceUnits=METERS', function(req, res, err) {
        console.log('geoCode response address: ' + res.candidate[0].formattedStreetAddress);
        console.log('geoCode response address: ' + res.candidate[0].formattedLocationAddress);
        callback(null, res.candidate[0])
    }
  ], function(err, results){
    var geoData = {
      phone: results[0].phone,
      streetAddress: results[1].formattedStreetAddress,
      locationAddress: results[1].formattedLocationAddress
    }
    cb(err, geoData);
  });
}







function alertOwner(message) {
  // tropo SMS message to user phone number
  console.log('alert-owner sent, tempF: ' + temp.value() +  'message: ' + message);
}

function gotReply() {
  if(firstTimer) clearTimeout(firstTimer);
  if(secondTimer) clearTimeout(secondTimer);
  if(tempInterval) clearInterval(tempInterval);
}

function main() {
  monitorTemperature();
  events.on("alert-owner", alertOwner);
  events.on("got-reply", gotReply);
}

main();