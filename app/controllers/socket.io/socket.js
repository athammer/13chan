var middleware = require('./../../middlewares/middleware.js');

module.exports = function(server, app){
    var io = require('socket.io').listen(server);
    io.on('connection', function (socket) {
        
        
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });
        
        
        socket.on('boardCheck', function (data) {
            if(data){
                console.log("Page is a board.");
                app.locals.boardCheck = true;
            }else{
                app.locals.boardCheck = false;
            }
        });
    });
};