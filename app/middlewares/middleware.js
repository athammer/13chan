var https = require('https');
var path = require('path')
var userModel = require('../models/user.js');
var emailTokens = require('../models/emailTokens.js');
var boardModel = require('../models/board.js');
var postContent = require('../models/postContent.js');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var nodemailer = require('nodemailer');
var fs = require("fs");
var readChunk = require('read-chunk');
var fileType = require('file-type');


module.exports = {

  /** =============================FLASH MIDDLEWARE============================= */
  flashAll: function(req, res, next) {
    console.log('flash ' + req.headers.host + '  ' + req.session.userName + '   ' + req.method  + ' vs ' + req.session.user + '   ' + req.sessionID + '   ' + req.session.cookie.test);
    if (req.method === 'GET') {
      if(typeof req.session.userName != 'undefined'){
        req.flash('user', req.session.userName);
      }
    }
    next();
  },
  clearFlash: function(req, res, next) {
      if (req.method === 'GET') {
          req.flash('message', null);
      }
      next();
  },


  /** =============================DOMAIN MIDDLEWARE============================= */
  prettifyDomain: function(req, res, next) {
      //console.log(req.get('host') + ' host');
      //console.log(req.hostname + ' host');
      //console.log(req.protocol);  cant use this on amazon use req.get('x-forwarded-proto') stead
      if(req.headers && (req.get('Host').slice(0, 4) === 'www.') && req.get('x-forwarded-proto') != null){   //must have elastic ip for this to workin aws and have to do last part bc health check pings it and doesnt use sslor anything
          //console.log("bad www.");
          var newHost = req.get('Host').slice(4);
          //console.log("new host" + newHost);
          var secureUrlNoWWW = "https://" + newHost + req.url;
          //console.log(secureUrlNoWWW);
          res.writeHead(301, { "Location":  secureUrlNoWWW });
          res.end();
          return 1;
      }
      //console.log(req.get('x-forwarded-proto'));
      //console.log(req.headers['x-forwarded-for']);
      if((req.get('x-forwarded-proto') != 'https') && (req.get('x-forwarded-proto') != null)){
          //console.log("to ssl");
          var secureURL = "https://" + req.headers.host + req.url;
          //console.log(secureURL);
          res.writeHead(301, { "Location":  secureURL });
          res.end();
          return 1;
      }
      next();
  },














  restrict: function(req, res, next) {
      if (req.session.user){
          //you have access
          console.log("good");
          next();
      }else{
          //no access 4 u kid
          console.log("good");
          req.flash('message', 'You do not have permission to view this page, try logging in.');
          res.redirect('/login');
      }
  },











    boardNameCheck: function(req, res, boardName){
        boardModel.findOne({ 'abbreviation': boardName }, 'name abbreviation nsfw slogan',  function (err, queredBoard) {
            if (err || queredBoard == null){
                req.flash('message', 'No such user board, try again.');
                res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
                //res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
                return console.error(err);
            }else{
                console.log("board exists");
                console.log("Board name: " + queredBoard);
                req.flash('boardNameF', queredBoard.name);
                req.flash('abbreviationF', queredBoard.abbreviation);
                req.flash('slogan', queredBoard.slogan);
                console.log(queredBoard.nsfw);
                if(queredBoard.nsfw == 'nsfw'){
                    res.render('./pages/boards/nsfwLegoBoard.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), boardName: req.flash('boardNameF'), abbreviation: req.flash('abbreviationF'), slogan: req.flash('slogan') });
                    return 1;
                }
                if(queredBoard.nsfw == 'swf'){
                    res.render('./pages/boards/legoBoard.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), boardName: req.flash('boardNameF'), abbreviation: req.flash('abbreviationF'), slogan: req.flash('slogan') });
                    return 1;
                }
                if(queredBoard.nsfw == 'adult'){ //unique one for adult?
                    res.render('./pages/boards/nsfwLegoBoard.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), boardName: req.flash('boardNameF'), abbreviation: req.flash('abbreviationF'), slogan: req.flash('slogan') });
                    return 1;
                }else{
                    console.log("error has occured on selecting nsfw board")
                    req.flash('message', 'Error has occured on board settings.');
                    res.redirect('/');
                    return 1;
                }
                // if swf then load normal theme, if nsfw then load red, if adult then load something

                //render board here
            }
        });
        return 1;
    },

    notABoard: function(req, res, next) {
        var domain = req.headers.host;
        var subDomain = domain.split('.');
        console.log(subDomain);
        console.log('host: 1' + subDomain[0]);
        console.log('host: 1' + subDomain);
        if(subDomain[0] == 'b'){
            var URL = "https://" + '13chan.co' + req.url;
            res.writeHead(301, { "Location":  URL });
            res.end();
            return 1;
        }
        next();
    },

    sendEmailVerification: function(req, res) {
        if(req.session.userName){
            emailTokens.remove({ 'userName': req.session.userName }, function (err) {
                if(err){
                    req.flash('message', 'Error finding username for userModel when deleting old tokens.');
                    res.status('404');
                    throw err;
                }
            });
            userModel.findOne({ 'username': req.session.userName }, 'email',  function (err, queredUser) {
                if(err){
                    throw err;
                }
                require('crypto').randomBytes(48, function(err, buffer) {
                    var token = buffer.toString('hex');
                    if(err){
                        throw err;
                    }
                    var email = new emailTokens({
                        tokenID: token,
                        dateCreated: Date.now(),
                        userName: req.session.userName,
                    });
                    email.save(function (err, user) {
                        if(err){
                            throw(err);
                        }
                        var mailOptions = {
                            from: '"13chan- Do not respond" <DoNotRespond@13chan.co>', // sender address
                            to: queredUser.email, // list of receivers
                            subject: '13chan- Email Verification ', // Subject line
                            //text: 'visit this url to verifiy your account. ' + 'https://13chan.co/emailVerification/' + token, // plaintext body
                            html: 'visit this url to verifiy your account. you have 30 days till it expires. You were send this email becuase you(hopefully) requested you needed a new token. 🐴' + 'https://13chan.co/emailVerification/' + token
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
                            req.flash('message', 'Email sent. If you did not get an email you probably mistyped in. Go to account settings and change your email to the correct one.');
                            res.redirect('/');
                            //we did it :DD
                        });
                    });
                });
            });
        }else{
            req.flash('message', 'You must be logged in to send verification emails dummy!');
            res.status('404');
        }
        return 1;
    },

    boardPost: function(req, res, body) {
        //do stuff here dummy
        //this is going to be a long one welp.
        //could they post from a non created board???
        //a new thread post should have an extra value so you know it's not just a someone posting inside a thread
        //will also have to handle if it is anonymous how things will look vs if it's not anonymous and all the special board settings with ejs magic
        //for the images/wembs/gifs we should only allow some size and some formats? until i know what the fuck im doing?
        //should check in here if board exists first before saving it dummy
        //i'll need to do some ejs trickery to get everything working.
        //http://stackoverflow.com/questions/34437531/passing-data-from-mongo-to-ejs

        //eventualy let users increase how large the files can be? by letting people pay for extra files size so i dont go broke

        var mimeAccepted = {
            //names dont matter as for each loop will take care of it

            //JPEG + JPG
            one: 'image/jpeg',
            two: 'image/pjpeg',
            three: 'image/jpeg',
            four: 'image/jpeg',
            five: 'image/pjpeg',
            six: 'image/jpeg',
            se7en: 'image/pjpeg',
            eight: 'image/jpeg',
            nine: 'image/pjpeg',

            //PNG
            ten: 'image/png',

            //GIF
            eleven: 'image/gif',

            //WebM
            twelve: 'video/webm',
            thirteen: 'audio/webm',

            //WebP
            fourteen: 'image/webp',

            //Flif NOTE: can't find it on docs must not have one yet?
            fifteen: 'image/flif',

            //Flash (might not use)
            sixteen: 'application/x-shockwave-flash'

        }

        const buffer = readChunk.sync(body.file, 0, 262);
        console.log(fileType(buffer));

        for (var i = 0; i < mimeAccepted.length; i++) {
            if (!(mimeAccepted[i] == fileType(buffer.mime))){
                req.flash('message', 'Error finding username for userModel');
                res.redirect('back'); //go back to where the request came from.
                return 0;
            }else{
                //good mime found
                var fileSize = fs.statSync(body.file);//inb4 error (will this throw error if image doesn't exist? does body.fileThread == null when doesn't exist?)
                var fileSizeInBytes = fileSize["size"];
                var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;  //might get input from the db if the board needs extra file size such as  a wallpaper board
                if(fileSizeInMegabytes > 4){
                    req.flash('message', 'File size is too large, must be under 4MBs');
                    res.redirect('back');
                    //or res.redirect(req.get('referer'));
                }else if(body.subjectThread){ //file is good size and is a thread
                    console.log("test THIS IS A THREAD YEEEEEAHAHAHAH");
                    //will need to increase board's thread count +=1; and prob other stuff to do with board
                    var postContent = new postContent({
                      parentBoard: board._id,
                      postID: String,
                    });

                }else if(body.subjectPost){//file is a post
                    console.log("test THIS IS A POST YEEEEEAHAHAHAH");
                    //http://mongoosejs.com/docs/populate.html

                }else{
                    req.flash('message', 'Bad Request, please resend.');
                    res.redirect('back');
                }
            }

        }


        return 1;

    },

    checkEmailToken: function(req, res, token) {
        emailTokens.findOne({ 'tokenID': token }, 'tokenID dateCreated userName',  function (err, queredUser) {
            var userNameTest = queredUser.userName;
            console.log(queredUser.userName + ' username!!');
            //if it is a bad token it just gives me a 502 bad gateway error
            if (err || queredUser == null){
                req.flash('message', 'No such token exists please resend verification email.');
                res.status('404');
                throw err;
            }
            //put in a if token it older then 30 days delete it and tell them to hurry their ass up when verifiying....

            //finaly not putting it in else statements for no reason :D
            console.log()
            userModel.findOneAndUpdate({'username': queredUser.userName}, { emailverified: true }, {upsert:true}, function(err, doc){
                if(err){
                    req.flash('message', 'Error finding username for userModel');
                    res.status('404');
                    throw err;
                }
                emailTokens.remove({ 'tokenID': token }, function (err) {
                    if(err){
                        req.flash('message', 'Error finding username for userModel');
                        res.status('404');
                        throw err;
                    }
                });
            });
        });
        req.flash('message', 'Email has been verified, (hopefully)');
        res.redirect('/');
        return 1;
    },

    userNameCheck: function(req, res, possibleUser) {
        userModel.findOne({ 'username': possibleUser }, 'username emailverified',  function (err, queredUser) {
            if (err || queredUser == null){
                req.flash('message', 'No such user exists, try again.');
                res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
                return console.error(err);
            }else{
                if(queredUser.emailverified){
                    req.session.cookie.emailVerified = true;

                }
                //console.log(req.session.userName + " " + queredUser);
                if(req.session.userName == queredUser.username){
                    if(!req.session.cookie.emailVerified){
                        req.flash('emailVerified', 'Your email has not been verified.');

                    }
                    res.render('./pages/user/user.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), emailVerified: req.flash('emailVerified')});
                }else{
                    res.render('./pages/user/publicUser.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
                }
            }
        });
    },

    changeEmail: function(req, res, body){
        if(!(req.session.user)){
            req.flash('message', 'Error: Not logged in, please login and try again.');
            res.redirect('/');
            return 0;
        }
        if(!(body.newEmail && body.password)){
            req.flash('message', 'Error: All fields were not filled please try again.');
            res.redirect('/user/' + req.session.userName + '/emailChange');
            return false;
        }
        userModel.findOne({ 'username': req.session.userName }, 'password',  function (err, queredUser) {
            if (err){
                console.log(err);
                req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                res.redirect('/user/' + req.session.userName + '/emailChange');
            }
            bcrypt.compare(body.password, queredUser.password, function(err, bool) {
                if (err){ //i should make this less copypasta
                    console.log(err);
                    req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                    res.redirect('/user/' + req.session.userName + '/emailChange');
                }
                if(bool){
                    console.log('good password');
                    bcrypt.hash(body.newEmail, saltRounds, function(err, hash) {
                        if(err){
                            throw err;
                        }
                        var newEmail = hash;
                        userModel.findOneAndUpdate({'username': req.session.userName}, { email: newEmail }, {upsert:false}, function(err, doc){
                            if (err){
                                console.log(err);
                                req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                                res.redirect('/user/' + req.session.userName + '/emailChange');
                            }else{
                                req.flash('message', 'Email successfully changed to ' + body.newEmail + '. Please reverifiy it!');
                                userModel.findOneAndUpdate({'username': req.session.userName}, { emailverified: false }, {upsert:false}, function(err, doc){
                                    if(err){
                                        throw err;
                                    }

                                });

                                //wow boy this copy pasta
                                emailTokens.remove({ 'userName': req.session.userName }, function (err) {
                                    if(err){
                                        req.flash('message', 'Error finding username for userModel when deleting old tokens.');
                                        res.status('404');
                                        throw err;
                                    }
                                });
                                require('crypto').randomBytes(48, function(err, buffer) {
                                    var token = buffer.toString('hex');
                                    if(err){
                                        throw err;
                                    }
                                    var email = new emailTokens({
                                        tokenID: token,
                                        dateCreated: Date.now(),
                                        userName: req.session.user,
                                        createdAt: Date.now()
                                    });
                                    email.save(function (err, user) {
                                        if(err){
                                            throw(err);
                                        }
                                        var mailOptions = {
                                            from: '"13chan- Do not respond" <DoNotRespond@13chan.co>', // sender address
                                            to: body.newEmail, // list of receivers
                                            subject: '13chan- Email Verification ', // Subject line
                                            //text: 'visit this url to verifiy your account. ' + 'https://13chan.co/emailVerification/' + token, // plaintext body
                                            html: 'visit this url to verifiy your account. you have 30 days till it expires. You were send this email becuase you(hopefully) requested you needed a new token. 🐴' + 'https://13chan.co/emailVerification/' + token
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
                                    res.redirect('/user/' + req.session.userName);
                                    return true;
                            }
                        });
                    });
                }else{
                    req.flash('message', 'Password is incorrect please try again!');
                    res.redirect('/user/' + req.session.userName + '/emailChange');
                    return false;
                }
            });
        });
    },

    changePassword: function(req, res, body){
        if(!(req.session.user)){
            req.flash('message', 'Error: Not logged in, please login and try again.');
            res.redirect('/');
            return 0;
        }
        if(!(body.newPassword && body.newPassword1 && body.password)){
            req.flash('message', 'Error: All fields were not filled please try again.');
            res.redirect('/user/' + req.session.userName + '/passwordChange');
            return 0;
        }
        if(!(body.newPassword == body.newPassword1)){
                req.flash('message', 'Error: Your two new passwords did not match.');
                res.redirect('/user/' + req.session.userName + '/passwordChange');
                return 0;
        }
        userModel.findOne({ 'username': req.session.userName }, 'password',  function (err, queredUser) {
            if (err){ //i should make this less copypasta
                req.flash('message', 'Error: Cannot validate user, please try again later.');
                res.redirect('/user/' + req.session.userName + '/passwordChange');
                throw(err);
            }
            bcrypt.compare(body.password, queredUser.password, function(err, bool) {
                if (err){ //i should make this less copypasta
                    req.flash('message', 'Error: Cannot change password please try again later.');
                    res.redirect('/user/' + req.session.userName + '/passwordChange');
                    throw(err);
                }
                if(bool){ //password is good
                    bcrypt.hash(body.newPassword, saltRounds, function(err, hash) {
                        userModel.findOneAndUpdate({'username': req.session.userName}, { password: hash }, {upsert:false}, function(err, doc){
                            if (err){ //i should make this less copypasta
                                req.flash('message', 'Error: Cannot update user, please try again later.');
                                res.redirect('/user/' + req.session.userName + '/passwordChange');
                                throw(err);
                            }else{
                                req.flash('message', 'Success: Password changed successfully.');
                                res.redirect('/user/' + req.session.userName);
                                return 1;
                            }
                        });
                        if (err){ //i should make this less copypasta
                            req.flash('message', 'Error: Cannot encrypt password, please try again later.');
                            res.redirect('/user/' + req.session.userName + '/passwordChange');
                            throw(err);
                        }
                    });
                }else{
                    req.flash('message', 'Error: Password was incorrect try again.');
                    res.redirect('/user/' + req.session.userName + '/passwordChange');
                    return 0;
                }
            });
        });
    }

};

//req.headers['host'] for domain with www.
//req.hostname without www
//var requestedUrl = req.protocol + '://' + req.get('Host') + req.url;
