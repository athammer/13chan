var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var mainLogic = require('./../logic/mainLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middleware = require("./../../middlewares/middleware.js");
var emailMiddleware = require("./../../middlewares/authentication/email.js");
var login = require("./../../middlewares/authentication/login.js");
var register = require("./../../middlewares/authentication/register.js");
var authentication = require("./../../middlewares/authentication/authenticationMiddleware.js");

//https://www.npmjs.com/package/req-flash
// respond with "hello world" when a GET request is made to the homepage
module.exports = function(app){ //need to export for app.js to find it

    app.get('/', function(req, res) {
        res.render('./pages/main/main.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    app.get('/social', function(req, res) {
        res.render('./pages/main/social.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    app.get('/about', function(req, res) {
        res.render('./pages/main/about.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });

    app.get('/boards', function(req, res) {
        res.render('./pages/main/about.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    app.get('/shop', function(req, res) {
        res.render('./pages/main/about.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    app.get('/donate', function(req, res) {
        res.render('./pages/main/about.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });

    app.get('/emailVerification/:token', function(req, res) {
        var token = req.params.token;
        emailMiddleware.checkEmailToken(req, res, token);
    });

    app.get('/robots.txt', function(req, res) {
        res.sendFile('/robots.txt', {'root': './'});
    });


    app.get('/.htaccess', function(req, res) {
        res.sendFile('/.htaccess', {'root': './'});
    });

    app.get('*', function(req, res){
        res.status('404').render('./pages/main/404.ejs', { userName: req.flash('user') });
    });

}


/*
<% if(typeof flashObject != 'undefined' && flashObject[0] != null){ %>
    <% for(var message in flashObject){ %>
        <div class="error_message"><p class="center-text"><%= flashObject[message] %></div></p>
    <% } %>
<% } %>
use this in ejs when you use req.flash(), instead of req.flash('message'). reason being is req.flash() takes all everything
and puts it in an object with each indiviual object in a json, so you need to loop through it to get the
stuff out which you can see above. if you call one sepcificaly you can't do multiple messages but you can more easily use them
and its simpleir
*/
