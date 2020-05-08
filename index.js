/* port for incoming control messages */
const myPort = 60030;

const events = require('events'),
	net = require('net'),
	dgram = require('dgram');

const rawMessage = Symbol('Raw message')
const sBusMessage = Symbol('SBUS message')
const errorMessage = Symbol('Error message')
const connectionMessage = Symbol('Connection message')
const closeMessage = Symbol('Close message')

const listener = net.createServer();
listener.listen(myPort, '0.0.0.0');
listener.on('connection', function(sock) {
	module.exports.emit(connectionMessage, sock);

	let inbox = Buffer.alloc(0)
	
	sock.on('data', deframe);

	function deframe(data) {
		let nextEndOfText = data.indexOf(3)
		if (nextEndOfText == -1) {
			inbox = Buffer.concat([inbox, data])
		} else {
			let nextStartOfText;
			if (inbox.length > 0) {
				parseMessage(Buffer.concat([inbox, data.slice(0, nextEndOfText)]))
				inbox = Buffer.alloc(0)
				nextStartOfText = data.indexOf(2, nextEndOfText)
			} else {
				nextStartOfText = data.indexOf(2)
			}

			while (nextStartOfText != -1) {
				nextEndOfText = data.indexOf(3, nextStartOfText)
				if (nextEndOfText == -1) {
					inbox = data.slice(nextStartOfText + 1)
					nextStartOfText = -1
				} else {
					parseMessage(data.slice(nextStartOfText+1, nextEndOfText))
					nextStartOfText = data.indexOf(2, nextEndOfText)
				}
			}
		}
	}

	function parseMessage(message) {
		module.exports.emit(rawMessage, message)
		const messageName = message.toString('ascii', 0, 4)
		if (messageName == "SBUS") {
			const body = message.toString('ascii', 4)
			const matches = body.match(/:([0-9]{2,}):([0-9]{2})/)
			if (matches.length > 2) {
				const channel = parseInt(matches[1])
				const cameraId = parseInt(matches[2])
				const zeroBasedCameraNumber = cameraId - 1
				module.exports.emit(sBusMessage, {
					channel,
					camera: {
						id: cameraId,
						bank: Math.floor(zeroBasedCameraNumber / 49),
						index: zeroBasedCameraNumber % 49
					},
					ipSocket: sock
				})
			}
		}
	}

	sock.on('close', function() {
		module.exports.emit(closeMessage, sock);
		sock.destroy();
	});

	sock.on('error', function(error) {
		module.exports.emit(errorMessage, {ipSocket: sock, error});
		module.exports.emit(closeMessage, sock);
		sock.destroy();
	});
});

function setProgramTally(address, programTally){
	const socket = dgram.createSocket('udp4');

	const hexString = programTally.toString(16);

	const message = Buffer.from('.ATLY:80000000:00000000.');
	message[0]  = 2;
	message[23] = 3;
	message.write(hexString, 14-hexString.length);

	socket.send(message, 0, message.length, 60031, address, function(err, bytes) {
		if (err) throw err;
		socket.close();
	});
};

module.exports = new events.EventEmitter();
module.exports.setTally = setProgramTally;
module.exports.eventTypes = {
	raw: rawMessage,
	sBus: sBusMessage,
	connection: connectionMessage,
	close: closeMessage,
	error: errorMessage
}
