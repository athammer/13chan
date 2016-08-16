var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var boardsLogic = require('./../logic/boardsLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middleware = require("./../../middlewares/middleware.js");


module.exports = function(router){ //need to export for app.js to find it
    
    
    router.get('/', function(req, res) {
        res.render('./pages/boards/create.ejs', { userName: req.flash('user') });
    });

    router.get('/test', function(req, res) {
        res.send('Welcome to test');
    });

    router.get('/user/asdfrrr', function(req, res) {
        res.send('Welcome to test');
    });
    
    router.get('/:board', function(req, res) {
        var board = req.params.board;
        middleware.boardNameCheck(req, res, board);
    });
    
    router.get('/:board/admin', function(req, res) {
        res.send('Welcome to test');
    });

    
};

