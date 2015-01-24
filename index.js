/*	
	This module exposes an object that simulates a pana AW HS50 Switcher.
	When you connect an


	Deze module fungeert als een simulator van de Panasonic HS50 Switcher.
	Zodanig dat de berichten die de controller normaal naar de Switcher stuurt,
	onderschept kunnen worden om ze voor andere doeleinden te gebruiken.
	Ook kan deze app TALLY berichten terug sturen naar de controller.
	
	Berichten in de richting SWITCHER ==> CONTROLLER gaan over UDP.
	Berichten in de richting SWITCHER <== CONTROLLER gaan over TCP.
*/
var events = require('events');
var util = require('util');
var dgram = require('dgram');
var net = require('net');
var HTTP = require('http');


const myPort = 60030; /* Eigen poort waar berichten op toekomen. */

const eventEmitter = new events.eventEmitter();

const listener = net.createServer();
listener.listen(myPort);
listener.on('connection', function(sock) {
	eventEmitter.emit('connection', sock);
	
	sock.on('data', function(data) {
		var position = data.toString().search(/SBUS:[0-9]{2}:[0-9]{2}/g);
		if (position !== -1) {
			var cTally = parseInt(data.toString().slice(position+8, position+10))-50;
			eventEmitter.emit('control', cTally, sock.remoteAddress); 
		}
	});

	sock.on('close', function() {
		eventEmitter.emit('close', sock.remoteAddress);
		sock.destroy();
	});

	sock.on('error', function() {
		eventEmitter.emit('close');
		console.log('The TCP socket to the Panasonic controller at IP: %s caused an error!', ipAddress);
		sock.destroy();
	});
});

function setProgramTally(address, programTally){
	const socket = dgram.createSocket('udp4');
	var message = new Buffer([0x02, 0x41, 0x54, 0x4c, 0x59, 0x3a, 0x38, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x3a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x03]);
	const hexString = programTally.toString(16);
	message.write(hexPrg, 14-hexString.length);

	socket.send(message, 0, message.length, 60031, address, function(err, bytes) {
		if (err) throw err;
		socket.close();
	});

};

module.exports.setProgramTally = setProgramTally;
module.exports.eventEmitter = eventEmitter;