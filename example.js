const rp = require('./');

rp.eventEmitter.on('control', function(tally, address) {
	console.log(tally, address);
});

rp.eventEmitter.on(
	'connection', function(sock) {
		console.log(sock.remoteAddress, 'connected')
	}
);

rp.setProgramTally()

//one liner
//const rp=require('./');rp.eventEmitter.on('control',function(tally, address){console.log(tally,address);});rp.eventEmitter.on('connection', function(sock) {console.log(sock.remoteAddress, 'connected')});