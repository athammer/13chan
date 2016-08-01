

module.exports = function(server){
    var io = require('socket.io').listen(server);
    io.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });
        
        
        socket.emit('boardCheck', { hello: 'world' });
        socket.on('boardCheck', function (data) {
            if(data){
                console.log("Page is a board.");
                require('./../../middleware/middleware.js').boardSubDomain;
            }
        });
    });
};