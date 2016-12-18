var userModel = require('../../models/user.js');
var emailModel = require('../../models/emailTokens.js');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

module.exports = function(body, app, res, req){ //need to export for app.js to find it
    console.log("Registering in user.");
    var password = body.passwordRegister;
    if(!(body.usernameRegister && body.passwordRegister && body.emailRegister)){
        req.flash('message', "Error: One of the inputs was not filled please retry and fill in all fields.");
        res.redirect("/register");
        return false;
    }
    var regex = {
        email: /^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z0-9.-]+$/i, //http://regexlib.com/REDetails.aspx?regexp_id=5011
        name: /^[A-Za-z0-9_]{3,24}$/, //http://www.9lessons.info/2009/03/perfect-javascript-form-validation.html
        password: /.{8,}/
    };
    var emailReg = regex.email.test(body.emailRegister); //pretty nifty
    var userReg = regex.name.test(body.usernameRegister);
    var passwordReg = regex.password.test(body.password);

    //here we go....
    if(!emailReg && !userReg && !passwordReg){
        req.flash('message', "Error: Email, username and password is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!emailReg && !userReg){
        req.flash('message', "Error: Email and username is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!emailReg && !passwordReg){
        req.flash('message', "Error: Email and password is in wrong format, please correct this.");
        res.redirect("/register");
        return false;
    }
    if(!userReg && !passwordReg){
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
    if(!passwordReg){
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
        bcrypt.hash(body.emailRegister, saltRounds, function(err, hash) {
            if (err){
                return console.error(err);
            }
            var emailRegister = hash;
            var user = new userModel({
                username: body.usernameRegister,
                password: password,
                email: emailRegister,
                date: Date.now(),
                forumposts: 0,
                timespent: 0,
                lastloggedin: Date.now(),
                emailverified: false
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
                            req.flash('message', "Error: Cannot save user");
                            res.redirect("/register");
                            return console.error(err);
                        }else{
                            console.log("user saved to database.");
                            req.flash('message', "Success! User created. Check your email for a verifcation email.");
                            req.session.user = body.usernameRegister;
                            req.session.userName = body.usernameRegister;
                            req.session.cookie.name = body.usernameRegister;
                            //req.session.expires = null;
                            req.session.cookie.maxAge = 1000 /* 1 sec*/ * 60 * 60 * 2; //2 hours
                            req.session.cookie.rolling = true;
                            res.redirect("/user/" + req.session.userName);
                            // setup e-mail data with unicode symbols
                            require('crypto').randomBytes(48, function(err, buffer) {
                                var token = buffer.toString('hex');
                                if(err){
                                    throw err;
                                }

                                var email = new emailModel({
                                    tokenID: token,
                                    dateCreated: Date.now(),
                                    userName: body.usernameRegister,
                                    createdAt: Date.now()

                                });
                                email.save(function (err, user) {
                                    if(err){
                                        throw(err);
                                    }
                                    var mailOptions = {
                                        from: '"13chan- Do not respond" <DoNotRespond@13chan.co>', // sender address
                                        to: body.emailRegister, // list of receivers
                                        subject: '13chan- Email Verification ', // Subject line
                                        //text: 'visit this url to verifiy your account. ' + 'https://13chan.co/emailVerification/' + token, // plaintext body
                                        html: 'visit this url to verifiy your account. you have 30 days till it expires. 🐴' + 'https://13chan.co/emailVerification/' + token
                                    };

                                    // send mail with defined transport object

                                    var smtpConfig = {
                                        host: 'smtp.zoho.com',
                                        port: 465,
                                        secure: true, // use SSL
                                        auth: {
                                            user: 'DoNotRespond@13chan.co',
                                            pass: process.env.DONOTRESPOND_EMAIL_PASS
                                        }
                                    };
                                    var transporter = nodemailer.createTransport(smtpConfig);
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if(error){
                                            throw error;
                                        }
                                        console.log('Message sent: ' + info.response);
                                        return true;
                                        //we did it :DD
                                    });
                                });
                            });
                        }
                    });
                }else{
                    if (queredUser.username != null){
                        if(queredUser.email != null){
                            req.flash('message', "Error: Email and username already exists please use another email and username.");
                            res.redirect("/register");
                            return false;
                        }
                        req.flash('message', "Error: User already exists please use another name.");
                        res.redirect("/register");
                        return false;
                    }
                    if (err || queredUser.email != null){
                        req.flash('message', "Error: Email already exists please use another email.");
                        res.redirect("/register");
                        return false;
                    }
                }
            });
        });
    });
};
