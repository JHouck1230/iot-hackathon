"use strict";

require("dotenv").config();

const PORT = 3000;

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

var auth = 'bearer eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI4YTVkZjFmMS1mZTJkLTRlNDEtYTRhZC1kODE3MjYxNzI2YzMiLCJzdWIiOiJqb3NoIiwic2NvcGUiOlsiaWUtcGFya2luZy56b25lcy4yZGNhMjZiNi02OGYxLTRlYjQtYmE2MS1hM2JiYTY3NzMwNDgudXNlciIsImllLXB1YmxpYy1zYWZldHkuem9uZXMuNTBiOTEzODctMWY0ZC00NDYwLTllMjgtYWFjMDJiY2QxMzY1LnVzZXIiLCJ1YWEucmVzb3VyY2UiLCJpZS1wZWRlc3RyaWFuLnpvbmVzLjE4NDMwNGYxLTdiNWMtNDgyMS1hMzRhLWQ0ZTgwNjkzZTZjMi51c2VyIiwib3BlbmlkIiwidWFhLm5vbmUiXSwiY2xpZW50X2lkIjoiam9zaCIsImNpZCI6Impvc2giLCJhenAiOiJqb3NoIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiI5MWRhODg2MyIsImlhdCI6MTQ2MzA2MTIxMSwiZXhwIjoxNDYzMTA0NDExLCJpc3MiOiJodHRwczovL2MwYzMwNGNiLTUxNTUtNDBhNC04OWRlLWNkNmNhZGQxZGEyZC5wcmVkaXgtdWFhLnJ1bi5hd3MtdXN3MDItcHIuaWNlLnByZWRpeC5pby9vYXV0aC90b2tlbiIsInppZCI6ImMwYzMwNGNiLTUxNTUtNDBhNC04OWRlLWNkNmNhZGQxZGEyZCIsImF1ZCI6WyJqb3NoIiwiaWUtcGFya2luZy56b25lcy4yZGNhMjZiNi02OGYxLTRlYjQtYmE2MS1hM2JiYTY3NzMwNDgiLCJpZS1wdWJsaWMtc2FmZXR5LnpvbmVzLjUwYjkxMzg3LTFmNGQtNDQ2MC05ZTI4LWFhYzAyYmNkMTM2NSIsInVhYSIsImllLXBlZGVzdHJpYW4uem9uZXMuMTg0MzA0ZjEtN2I1Yy00ODIxLWEzNGEtZDRlODA2OTNlNmMyIiwib3BlbmlkIl19.Hu8eEW5__0pUmvvfmeQbllWmg8m9sarFrFf_H5WWMDmEHdwebgkgMCWx-tBRKbKjnyndBOqQQY1iwzmX8ae2B9Ngbdq_bNImkVDKGNCusXAsf7JZUGOTS_rWNF9aK1_n8hHRpGyoLL3q3AXzbinLNDkcxFosHIMDeWj7v2k9ESB9ymFGp1W4W9FLC_UjvJZEljtptinRd23SI5kkpZhIQosFlKc3EqnEsWzTbPvRTfYJZXYGJmf877nsTaizYdvbHJw-ARuEzBHPWgKsXyVtF3JtcM08GlYkp1HI3mfULFIhLFheDwPKtZUd5a51FjmC-An3s588Ab2gneeWjKWC6g';
var zone = '2dca26b6-68f1-4eb4-ba61-a3bba6773048';
var wsUrl = 'wss://ie-websocket-server-prod.run.aws-usw02-pr.ice.predix.io/consume?routing-key=22c8ba8b-5cb4-43a6-adc9-55e80b063dfc&service-name=ie-parking';

var headers = {
	"authorization": auth,
	"predix-zone-id": zone,
	"origin": "https://www.predix.io" // some value is required here.
};

var socket = new WebSocket(wsUrl, {headers: headers});

app.use('/open-ws', function(req, res) {
	// var wsUrl = req.get('x-endpoint'),
	// 	  auth = req.get('authorization'),
	// 	  zone = req.get('predix-zone-id');
		  console.log('headers: ', headers);
		  console.log('wsUrl: ', wsUrl);
		  console.log('auth: ', auth);
		  console.log('zone: ', zone);
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
			var sockets = {};
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

var server = http.createServer(app);
server.listen(PORT, function() {
	console.log(`Server listening on port ${PORT}`);
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