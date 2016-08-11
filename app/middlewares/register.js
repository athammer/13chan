var userModel = require('../../app/models/user.js');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var nodemailer = require('nodemailer');

module.exports = function(body, app, res, req){ //need to export for app.js to find it
    console.log("Registering in user.");
    var password = body.passwordRegister;
    if(!(body.usernameRegister && body.passwordRegister && body.emailRegister && body.questionRegister && body.answerRegister)){
        req.flash('message', "Error: One of the inputs was not filled please retry and fill in all fields.");
        res.redirect("/register");
        return false;
    }
    var regex = {
        email: /^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z0-9.-]+$/i, //http://regexlib.com/REDetails.aspx?regexp_id=5011
        name: /^[A-Za-z0-9_]{3,20}$/, //http://www.9lessons.info/2009/03/perfect-javascript-form-validation.html
        password: /.{8,}/
    };
    var emailReg = regex.email.test(body.emailRegister);
    var userReg = regex.name.test(body.usernameRegister);
    var password = regex.password.test(body.password);
    
    //here we go....
    if(!emailReg && !userReg && !password){
        req.flash('message', "Error: Email, username and password is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!emailReg && !userReg){
        req.flash('message', "Error: Email and username is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!emailReg && !password){
        req.flash('message', "Error: Email and password is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!userReg && !password){
        req.flash('message', "Error: Username and password is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!emailReg){
        req.flash('message', "Error: Email is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!userReg){
        req.flash('message', "Error: Username is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!password){
        req.flash('message', "Error: Passowrd is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    //asdfasdfsdafadsfds case switch better? fuck it for now
    bcrypt.hash(body.passwordRegister, saltRounds, function(err, hash) {
        if (err){
            return console.error(err);
        }
        password = hash;
        bcrypt.hash(body.questionRegister, saltRounds, function(err, hash) {
            if (err){
                return console.error(err);
            }
            var questionRegister = hash;
            bcrypt.hash(body.answerRegister, saltRounds, function(err, hash) {
                var answerRegister = hash;
                if (err){
                    return console.error(err);
                }
                var user = new userModel({
                    username: body.usernameRegister,
                    password: password,
                    email: body.emailRegister,
                    question: questionRegister,
                    answer: answerRegister,
                    date: Date.now(),
                    forumposts: 0,
                    timespent: 0,
                    lastloggedin: Date.now()
                });
                userModel.findOne({ 'username': body.usernameRegister }, 'username email',  function (err, queredUser) {
                    if(err){
                        req.flash('message', "Server error has occured run the hills.");
                        return console.error(err);
                    }
                    if(queredUser == null){
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
                    }else{
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
                    }
                });
            });
        });        
    });
};


