var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var userLogic = require('./../logic/userLogic.js');
var controllerLogic = require('./../logic/controllerLogic.js');
var middleware = require('./../../middlewares/middleware.js');

module.exports = function(app){
    
    app.get('/create', userLogic.restrict, function(req, res) {
        res.render('./pages/user/create.ejs', { userName: req.flash('user') });
    });
    app.post('/create', jsonParser, function(req, res) {
        
    });

    
    
    app.get('/register', userLogic.loginCheck, function(req, res) {
        res.render('./pages/user/register.ejs', { userName: req.flash('user') });
    });
    app.post('/register', jsonParser, function(req, res) {
        console.log("Post from register");
        console.log("Attempting to register new user: " + req.body.usernameRegister);
        require('./../../middlewares/register.js')(req.body, app, res, req); //req.body, req, to lazy to fix
    });
    
    
    app.get('/login', userLogic.loginCheck, function(req, res) {
        res.render('./pages/user/login.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
    });
    app.post('/login', jsonParser, function(req, res) {
        
        console.log("Post from login");
        console.log("Logging in user: " + req.body.usernameLogin);
        require('./../../middlewares/login.js')(req.body, app, res, req);
        
    });
    
    
    app.get('/logout', function(req, res) {
        req.session.destroy(function(){
            res.redirect("/");
            //will delete cookie but then once redirected will create a new one.
        });
        req.flash('message', null);
        req.flash('user', null);
    });
    
    
    // app.get('/user', controllerLogic.restrict, function(req, res) {
    //     res.render('./pages/user/user.ejs', { userName: req.flash('user') });
    //     req.flash('message', null);
    // });
    app.get('/user/:name', function(req , res){
//        res.render('./pages/user/user.ejs', { userName: req.flash('user') }); //cant do this yet need logic first
        var userName = req.params.name;
        middleware.userNameCheck(req, res, userName);
        req.flash('message', null);
    });
    
    
    app.get('/user/:name/settings', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/settings.ejs', { userName: req.flash('user') });
        req.flash('message', null);
    });
    
    
    app.get('/user/:name/composeMessage', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/composeMessage.ejs', { userName: req.flash('user') });
        req.flash('message', null);
    });
    
    
    app.get('/user/:name/inbox', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/inbox.ejs', { userName: req.flash('user') });
        req.flash('message', null);
    });
    
    
    app.get('/user/:name/emailChange', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/emailChange.ejs', { userName: req.flash('user') });
        req.flash('message', null);
    });
    app.post('/user/:name/emailChange', jsonParser, function(req, res) {
        middleware.changeEmail(res, req, req.body);
    });
    
    
    app.get('/user/:name/passwordChange', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/passwordChange.ejs', { userName: req.flash('user') });
        req.flash('message', null);
    });
    
    
    app.get('/user/:name/questionChange', controllerLogic.restrict, function(req, res) {
        res.render('./pages/user/account/questionChange.ejs', { userName: req.flash('user') });
        req.flash('message', null);
    });
}