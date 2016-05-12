"use strict";

require("dotenv").config();

var fs = require("fs");
var path = require("path");
var request = require("request");
var express = require("express");
var WebSocket = require('ws');
var http = require('http');
// var tropo_webapi = require('tropo-webapi');

// var config = JSON.parse(
//   fs.readFileSync(path.join(__dirname, "config.json"))
// );


var app = express();

var auth = process.env.auth;
var zone = process.env.zone;
var wsUrl = process.env.wsUrl;

var headers = {
	"authorization": auth,
	"predix-zone-id": zone,
	"origin": "https://www.predix.io" // some value is required here.
};

var socket = new WebSocket(wsUrl, {headers: headers});

app.use('/open-ws', function(req, res) {
	var wsUrl = req.get('x-endpoint'),
		  auth = req.get('authorization'),
		  zone = req.get('predix-zone-id');
	if (!auth || !zone || !wsUrl) {
		res.status(500).send({"error": "one of the required headers is missing: x-endpoint, authorization, or predix-zone-id."});
	} else {
		console.log('opening a socket to: ' + wsUrl);
		// TODO: check origin? do some security stuff.
		// open socket to wsUrl, pass in authorization & zone-id headers.
		var headers = {
			"authorization": auth,
			"predix-zone-id": zone,
			"origin": "https://www.predix.io" // some value is required here.
		};
		var socket = new WebSocket(wsUrl, {headers: headers});
		socket.on('error', function(error) {
			console.log('error opening socket: ' + error);
			res.status(500).send({"error": error + '', "url": wsUrl});
		});
		socket.on('close', function(code, message) {
			console.log('socket closed. ' + code + ' ' + message);
		});
		socket.on('open', function() {
			// store socket in memory with an ID & expiration
			// return socket ID to browser
			var socketId = Math.random() * 10000000000000000000;
			socket.socketId = socketId;
			socket.expiration = Date.now() + 1200000; // 20 min
			sockets[socketId] = socket;
			// console.log('ready state: ' + socket.readyState);
			console.log('sockets: ' + Object.keys(sockets).length);
			res.status(200).send({"socketId": socketId, "readyState": "OPEN"});
		});
	}
});



// var temp = new (require("jsupm_grove").GroveTemp)(3);
// var events = new (require("events").EventEmitter)();
// var message = '';
// var firstTimer, secondTimer, tempInterval;

// function monitorTemperature() {
//   var prev = 0;
//   tempInterval = setInterval(function() {
// 	  var temperatureC = temp.value();
// 	  var temperatureF = (temperatureC * (9 / 5)) + 32;

//     console.log("current temp: " + temperatureF);
//     if (temperatureF >= 0) {
//     	// console.log('message: ', message);
// 		  	message = 'Current temperature in your vehicle is ' + temperatureF +'. Please return to vehicle IMMEIDATELY to protect occupants from suffering from HEATSTROKE or DEATH! Reply "OK" to acknowledge.';
// 		  	events.emit("alert-owner" + temperatureF + message);
//     	}
// 	  		firstTimer = setTimeout(function(){
// 	  			message = 'Current temperature in your vehicle is ' + temperatureF +'! Emergency services will be contacted in 2 minutes if acknowledgement is not received. Reply "HELP" to contact emergency services now OR reply "OK" to prevent emergency services from being contacted.';
// 		    	events.emit("alert-owner" + temperatureF + message);
// 	  		},12000);
//     	}
// 	  		secondTimer = setTimeout(function(){
// 	  			message = 'Current temperature in you vehicle is ' + temperatureF +'! Emergency services have been contacted with will arrive at your vehicle shortly!';
// 		    	events.emit("contact-emergency-services");
// 		    	events.emit("alert-owner" + temperatureF + message);
// 	  		},12000);
//     	}

//     }
//     prev = temperatureF;
//   }, 500);
// }

// events.once('contact-emergency-services', function() {
// 	// pitney bowes for geoLocation of vehicle OR predix for parking location
// 	// pitney bowes for nearest emergency service
// 	// tropo/pitney bowes to contact emergency service
// 	console.log('emergency services contacted');
// 	gotReply();
// 	// request.get('https://ie-parking.run.aws-usw02-pr.ice.predix.io/v1/locations/')
// })

// function alertOwner(message) {
// 	// tropo SMS message to user phone number
// 	console.log('alert-owner sent, tempF: ' + temp.value() +	'message: ' + message);
// }

// function gotReply() {
// 	if(firstTimer) clearTimeout(firstTimer);
// 	if(secondTimer) clearTimeout(secondTimer);
// 	if(tempInterval) clearInterval(tempInterval);
// }

// function main() {
//   monitorTemperature();
//   events.on("alert-owner", alertOwner);
//   events.on("got-reply", gotReply);
// }

// main();