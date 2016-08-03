var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var boardsLogic = require('./../logic/boardsLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middlewares = require("./../../middlewares/middleware.js");

module.exports = function(app){ //need to export for app.js to find it
    
    
    app.get('/create', controllerLogic.restrict, function(req, res) {
        res.render('./pages/boards/create.ejs', { userName: req.flash('user') });
    });
    app.post('/create', jsonParser, function(req, res) {
        boardsLogic.createboard(req, res, req.body);
    });


    app.get('/search', function(req, res) {
        res.render('./pages/boards/search.ejs', { userName: req.flash('user') });
    });
    
    
    app.get('/test', middlewares.boardSubDomain, function(req, res) {
        res.render('./pages/boards/legoBoard.ejs', { userName: req.flash('user') });
        
    });
};



