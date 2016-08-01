var socketio = require('socket.io');

module.exports = function(server){
    var io = require('socket.io').listen(server);
    io.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });
    });
}