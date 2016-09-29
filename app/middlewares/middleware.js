var https = require('https');
var userModel = require('../../app/models/user.js');
var emailTokens = require('../../app/models/emailTokens.js');
var boardModel = require('../../app/models/board.js');
var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    
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
    
    boardPost: function(req, res, body) {
        //do stuff here dummy
        return 1;
    },
    
    checkEmailToken: function(req, res, token) {
        emailTokens.findOne({ 'tokenID': token }, 'tokenID dateCreated userName',  function (err, queredUser) {
            if (err || queredUser == null){
                req.flash('message', 'No such token exists please resend verification email.');
                res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
                throw err;
            }
            //put in a if token it older then 30 days delete it and tell them to hurry their ass up when verifiying....

            //finaly not putting it in else statements for no reason :D
            userModel.findOneAndUpdate({'username': queredUser.userName}, { emailverified: true }, {upsert:true}, function(err, doc){
                if(err){
                    req.flash('message', 'Error finding username for userModel');
                    res.redirect('/');
                    throw err;
                }
                emailTokens.remove({ 'userName': queredUser.userName }, function(err) {
                    if (!err) {
                        req.flash('message', 'Error finding quered User for emailTokens');
                        res.redirect('/');
                        throw err;
                    }
                    req.flash('message', 'Email has been verified, (hopefully)');
                    res.redirect('/');
                });
            });
        });
        return 1;
    },
    
    userNameCheck: function(req, res, possibleUser) { 
        userModel.findOne({ 'username': possibleUser }, 'username',  function (err, queredUser) {
            if (err || queredUser == null){
                req.flash('message', 'No such user exists, try again.');
                res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
                return console.error(err);
            }else{
                console.log("user exists");
                console.log(req.session.userName + " " + queredUser);
                if(req.session.userName == queredUser.username){
                    res.render('./pages/user/user.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
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
                    userModel.findOneAndUpdate({'username': req.session.userName}, { email: body.newEmail }, {upsert:false}, function(err, doc){
                        if (err){
                            console.log(err);
                            req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                            res.redirect('/user/' + req.session.userName + '/emailChange');
                        }else{
                            req.flash('message', 'Email successfully changed to ' + body.newEmail + '.');
                            res.redirect('/user/' + req.session.userName);
                            return true;
                        }
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