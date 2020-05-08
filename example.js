const rp = require('./');

rp.on(rp.eventTypes.sBus, function({channel, camera, ipSocket}) {
	console.log(ipSocket.remoteAddress, channel, camera);
});

rp.on(rp.eventTypes.connection, function(sock) {
	console.log(sock.remoteAddress, 'connected')
});

rp.on(rp.eventTypes.close, function(sock) {
	console.log(sock.remoteAddress, 'disconnected')
})

rp.setTally("10.1.0.18", 1)
rp.setTally("10.1.0.18", 2)
rp.setTally("10.1.0.18", 4)
rp.setTally("10.1.0.18", 8)

//one liner
//const rp=require('./');rp.eventEmitter.on('control',function(tally, address){console.log(tally,address);});rp.eventEmitter.on('connection', function(sock) {console.log(sock.remoteAddress, 'connected')});