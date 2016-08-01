var https = require('https');
var userModel = require('../../app/models/user.js');
var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    
    prettifyDomain: function(req, res, next) {
        if(req.headers && req.get('Host').slice(0, 4) === 'www.'){
            var newHost = req.get('Host').slice(4);
            //console.log("new host" + newHost);
            var secureUrlNoWWW = "https://" + newHost + req.url;
            //console.log(secureUrlNoWWW);
            res.writeHead(301, { "Location":  secureUrlNoWWW });
            res.end();
            return 1;
        }
        if(!req.secure){
            var secureURL = "https://www." + req.hostname + req.url;
            res.writeHead(301, { "Location":  secureURL });
            res.end();  
        } 
        next();
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
                    res.render('./pages/user/user.ejs', { userName: req.flash('user') });
                }else{
                    res.render('./pages/user/publicUser.ejs', { userName: req.flash('user') });
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