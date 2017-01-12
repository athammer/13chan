var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var boardsLogic = require('./../logic/boardsLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middleware = require("./../../middlewares/middleware.js");
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = function(router){ //need to export for app.js to find it
    //test out session sbellow

    router.get('/', function(req, res) {
        res.render('./pages/boards/mainB.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    router.get('/test', function(req, res) {
        res.send('Welcome to test');
    });


    router.get('/:board', function(req, res) {
        var board = req.params.board;
        middleware.boardNameCheck(req, res, board);
        middleware.flashBoardObject(req, res, board);
    });
    router.post('/:board', jsonParser, function(req, res) {
        //could they post from a non created board???
        //a new thread post should have an extra value so you know it's not just a someone posting inside a thread
        //will also have to handle if it is anonymous how things will look vs if it's not anonymous and all the special board settings
        //for the images/wembs/gifs we should only allow some size and some formats? until i know what the fuck im doing?
                //should check in here if board exists first before saving it dummy
        var board = req.params.board;
        middleware.boardNameCheck(req, res, board);
        middleware.boardPost(req, res, req.body);

    });

    router.get('/:board/:thread', function(req, res) {
        var board = req.params.board;
        middleware.boardNameCheck(req, res, board);
        middleware.flashThreadObject(req, res, board);
    });
    router.post('/:board/:thread', jsonParser, function(req, res) {
        //could they post from a non created board???
        //a new thread post should have an extra value so you know it's not just a someone posting inside a thread
        //will also have to handle if it is anonymous how things will look vs if it's not anonymous and all the special board settings
        //for the images/wembs/gifs we should only allow some size and some formats? until i know what the fuck im doing?
                //should check in here if board exists first before saving it dummy
        var board = req.params.board;
        middleware.boardNameCheck(req, res, board);
        middleware.boardPost(req, res, req.body);

    });

    router.get('/:board/admin', function(req, res) {
        res.send('Welcome to test');
    });

    router.get('*', function(req, res){
        res.status('404').render('./pages/main/404.ejs', { userName: req.flash('user') });
    });
};
