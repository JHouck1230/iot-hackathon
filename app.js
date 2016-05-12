"use strict";

var fs = require("fs");
var path = require("path");
var config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"))
);
var temp = new (require("jsupm_grove").GroveTemp)(0);
var events = new (require("events").EventEmitter)();

function monitorTemperature() {
	var message = '';
  var prev = 0;
  var tempInterval = setInterval(function() {
    var temperatureC = temp.value();
    var temperatureF = (temperatureC * (9 / 5)) + 32;

    console.log("current temp: ", temperatureF);
    if (prev < config.ALARM_THRESHOLD && temperatureF >= config.ALARM_THRESHOLD) {
    	message = `Current temperature in your vehicle is ${temperatureF}. Please return to vehicle IMMEIDATELY to protect occupants from suffering from HEATSTROKE or DEATH! Reply "OK" to acknowledge.`;
    	events.emit("alert-owner", temperatureF, message);
  		var firstTimer = setTimeout(function(){
  			message = `Current temperature in your vehicle is ${temperatureF}! Emergency services will be contacted in 2 minutes if acknowledgement is not received. Reply "HELP" to contact emergency services now OR reply "OK" to prevent emergency services from being contacted.`;
	    	events.emit("alert-owner", temperatureF, message);
	  		var secondTimer = setTimeout(function(){
	  			message = `Current temperature in you vehicle is ${temperatureF}! Emergency services have been contacted with will arrive at your vehicle shortly!`;
		    	events.emit("alert-owner", temperatureF, message);
		    	events.emit("contact-emergency-services");
	  		},120000);
  		},120000);
    }
    prev = temperatureF;
  }, 500);
}

events.once('contact-emergency-services', function() {
	// pitney bowes for geoLocation of vehicle/predix for parking location
	// pitney bowes for nearest emergency service
	// tropo/pitney bowes to contact emergency service
	console.log('emergency services contacted');
})

events.once("alert-owner", function(tempF, message) {
	// tropo SMS message to user phone number
	console.log(`alert-owner sent;
							tempF: ${tempF}
							message: ${message}`);
})

function gotReply() {
	clearTimeout(firstTimer);
	clearTimeout(secondTimer);
	clearInterval(tempInterval);
}

function main() {
  monitorTemperature();
  events.on("got-reply", gotReply);
}

main();