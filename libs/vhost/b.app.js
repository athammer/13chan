var express = require('express');
var app = express();
var router = express.Router();
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var middlewares = require("./../../app/middlewares/middleware.js");


require('./../../app/controllers/router/routes.js')(app);


app.use(router);

exports.app = app;