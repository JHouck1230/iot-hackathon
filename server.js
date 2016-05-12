"use strict";

require("dotenv").config();

const PORT = 3000;

var fs = require("fs");
var path = require("path");
var express = require("express");
var WebSocket = require('ws');
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

server.listen(PORT, function() {
	console.log(`Server listening on port ${PORT}`);
});

app.get('/', function(req, res, next) {
	res.sendFile(path.join(__dirname, './index.html'));
});

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
	// var wsUrl = req.get('x-endpoint'),
	// 	  auth = req.get('authorization'),
	// 	  zone = req.get('predix-zone-id');
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
			socket.emit('socket for now: ' + socket);
			res.status(200).send({"socketId": socketId, "readyState": "OPEN"});
		});
	}
});
