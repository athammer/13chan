var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var userLogic = require('./../logic/userLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middleware = require('./../../middlewares/middleware.js');
var registerMiddleware = require('./../../middlewares/authentication/register.js');
var loginMiddleware = require('./../../middlewares/authentication/login.js');
var emailMiddleware = require("./../../middlewares/authentication/email.js");
var userMiddleware = require("./../../middlewares/user/userMiddleware.js");
var authentication = require("./../../middlewares/authentication/authenticationMiddleware.js");

module.exports = function(app){


    app.get('/register', userLogic.loginCheck, function(req, res) {
        res.render('./pages/user/register.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });
    app.post('/register', jsonParser, function(req, res) {
        console.log("Post from register");
        console.log("Attempting to register new user: " + req.body.usernameRegister);
        registerMiddleware(req.body, app, res, req); //req.body, req, to lazy to fix
    });


    app.get('/login', userLogic.loginCheck, function(req, res) {
        res.render('./pages/user/login.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });
    app.post('/login', jsonParser, function(req, res) {

        console.log("Post from login");
        console.log("Logging in user: " + req.body.usernameLogin);
        loginMiddleware(req.body, app, res, req);

    });


    app.get('/logout', function(req, res) {
        req.session.destroy(function(){
            res.redirect("/");
            //will delete cookie but then once redirected will create a new one.
        });
        req.flash('user', null);
    });

    app.get('/resendverificationemail', jsonParser, function(req, res) {
        userMiddleware.sendEmailVerification(req, res);


    });

    app.get('/user/:name', function(req , res){
        var userName = req.params.name;
        userMiddleware.userNameCheck(req, res, userName);

    });


    app.get('/user/:name/settings', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/settings.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    app.get('/user/:name/composeMessage', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/composeMessage.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    app.get('/user/:name/inbox', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/inbox.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });


    app.get('/user/:name/emailChange', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/emailChange.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });
    app.post('/user/:name/emailChange', jsonParser, function(req, res) {
        emailMiddleware.changeEmail(req, res, req.body);
    });


    app.get('/user/:name/passwordChange', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/passwordChange.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });
    app.post('/user/:name/passwordChange', jsonParser, function(req, res) {
        authentication.changePassword(req, res, req.body);
    });


    app.get('/user/:name/questionChange', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/questionChange.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });
};
