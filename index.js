/* port for incoming control messages */
const myPort = 60030;

const events = require('events'),
	net = require('net'),
	dgram = require('dgram');

module.exports = new events.EventEmitter();

const listener = net.createServer();
listener.listen(myPort);
listener.on('connection', function(sock) {
	module.exports.emit('connection', sock);
	
	sock.on('data', function(data) {
		var position = data.toString().search(/SBUS:[0-9]{2}:[0-9]{2}/g);
		if (position !== -1) {
			var cTally = parseInt(data.toString().slice(position+8, position+10))-50;
			module.exports.emit('control', cTally, sock.remoteAddress); 
		}
	});

	sock.on('close', function() {
		module.exports.emit('close', sock.remoteAddress);
		sock.destroy();
	});

	sock.on('error', function() {
		module.exports.emit('close');
		console.log('The TCP socket to the Panasonic controller at IP: %s caused an error!', ipAddress);
		sock.destroy();
	});
});

function setProgramTally(address, programTally){
	const socket = dgram.createSocket('udp4');

	const hexString = programTally.toString(16);

	var message = new Buffer('.ATLY:80000000:00000000.');
	message[0]  = 2;
	message[23] = 3;
	message.write(hexString, 14-hexString.length);

	socket.send(message, 0, message.length, 60031, address, function(err, bytes) {
		if (err) throw err;
		socket.close();
	});
};

module.exports.setTally = setProgramTally;