var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var boardsLogic = require('./../logic/boardsLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middleware = require("./../../middlewares/middleware.js");
var createBoard = require('./../../middlewares/board/createBoard.js')

module.exports = function(app){ //need to export for app.js to find it


    app.get('/create', controllerLogic.restrict, function(req, res) {
        res.render('./pages/boards/create.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });
    app.post('/create', jsonParser, function(req, res) {
        createBoard(req.body, app, res, req);
    });


    app.get('/search', function(req, res) {
        res.render('./pages/boards/search.ejs', { userName: req.flash('user') });
    });

};
