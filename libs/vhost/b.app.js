var express = require('express');
var app = express();
var router = express.Router();

var middlewares = require("./../../app/middlewares/middleware.js");


require('./../../app/controllers/router/routes.js')(app);


app.use(router);

exports.app = app;