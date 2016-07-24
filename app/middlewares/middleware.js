var https = require('https');
var userModel = require('../../app/models/user.js');
var bcrypt = require('bcrypt');

module.exports = {
    
    prettifyDomain: function(req, res, next) {
        if(req.headers && req.get('Host').slice(0, 4) === 'www.'){
            var newHost = req.get('Host').slice(4);
            //console.log("new host" + newHost);
            var secureUrlNoWWW = "https://" + newHost + req.url;
            //console.log(secureUrlNoWWW);
            res.writeHead(301, { "Location":  secureUrlNoWWW });
            res.end();  
        }
        if(!req.secure){
            var secureURL = "https://" + req.hostname + req.url;
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
        userModel.findOne({ 'username': req.session.user }, 'password',  function (err, queredUser) {
            if (err){
                console.log(err);
                req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                res.redirect('/user/' + req.session.user + '/emailChange');
            }
            bcrypt.compare(body.password, queredUser.password, function(err, bool) {
                if (err){ //i should make this less copypasta
                    console.log(err);
                    req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                    res.redirect('/user/' + req.session.user + '/emailChange');
                }
                if(bool){
                    console.log('good password');
                    userModel.findOneAndUpdate({'username': req.session.user}, { email: body.newEmail }, {upsert:false}, function(err, doc){
                        if (err){
                            console.log(err);
                            req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                            res.redirect('/user/' + req.session.user + '/emailChange');
                        }else{
                            req.flash('message', 'Email successfully changed to ' + body.newEmail + '.');
                            res.redirect('/user');
                            return true;
                        }
                        });

                }else{
                    req.flash('message', 'Password is incorrect please try again!');
                    res.redirect('/user/' + req.session.user + '/emailChange');
                    return false;
                }
            });
        });
    }
    

}

//req.headers['host'] for domain with www.
//req.hostname without www
//var requestedUrl = req.protocol + '://' + req.get('Host') + req.url;