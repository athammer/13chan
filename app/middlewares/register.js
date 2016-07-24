var userModel = require('../../app/models/user.js');
//var session = require('express-session');
var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function(body, app, res, req){ //need to export for app.js to find it
    console.log("Registering in user.");
    var password = body.passwordRegister;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err){
            return console.error(err);
        }
        password = hash;
        console.log(password);
        var user = new userModel({
            username: body.usernameRegister,
            password: password,
            email: body.emailRegister,
            question: body.questionRegister,
            answer: body.answerRegister,
            date: Date.now(),
            forumposts: 0,
            timespent: 0
        });
        userModel.findOne({ 'username': body.usernameRegister }, 'username email',  function (err, queredUser) {
            if(err){
                req.flash('message', "Server error has occured run the hills.");
                return console.error(err);
            }
            if (queredUser.username != null){
                if(queredUser.email != null){
                    req.flash('message', "Error: Email and username already exists please use another email and username.");
                    res.redirect("/register");
                    return true;
                }
                req.flash('message', "Error: User already exists please use another name.");
                res.redirect("/register");
                return true;
            }
            if (err || queredUser.email != null){
                req.flash('message', "Error: Email already exists please use another email.");
                res.redirect("/register");
                return true;
            }
            user.save(function (err, user) {
                if (err){
                    console.log("Error when saving to databse, sheeeeeeit.");
                    return console.error(err);
                }else{
                    console.log("user saved to database.");
                    req.session.user = body.usernameRegister;
                    req.session.userName = body.usernameRegister;
                    req.session.cookie.maxAge = 360000*2;
                    req.session.expires = null;
                    req.session.cookie.rolling = true;
                    res.redirect("/user/" + req.session.userName);
                }
                
            });
        });
    });
};
