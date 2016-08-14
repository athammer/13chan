var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var boardsLogic = require('./../logic/boardsLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middlewares = require("./../../middlewares/middleware.js");


module.exports = function(router){ //need to export for app.js to find it
    
    router.get('/', function(req, res) {
        res.send('Welcome to boards');
    });

};

