"use strict";

var groveSensor = require("jsupm_grove");
var temp = new groveSensor.GroveTemp(3);
var button = new groveSensor.GroveButton(2);

var socket = require('socket.io-client')('https://lit-meadow-10164.herokuapp.com/');

var occupantDetected = false;

(function init() {

  observeOccupancy();
  monitorTemperature();

})();

function observeOccupancy() {
  // button press will toggle occupancy status

  var prev;
  setInterval(function() {
    var buttonState = button.value();    

    if(buttonState && prev !== buttonState) {
      occupantDetected = !occupantDetected;
      console.log('occupantDetected:', occupantDetected);
    }

    prev = buttonState
  }, 50);
}

function monitorTemperature() {
  // observe temperature, and emit data to server
  
  var prev = 0;
  setInterval(function() {
    var temperatureC = temp.value();
    var temperatureF = (temperatureC * (9 / 5)) + 32;

    console.log("current temp: " + temperatureF);

    socket.emit('status', {
      temp: temperatureF,
      occupantDetected: occupantDetected
    });

  }, 500);
}