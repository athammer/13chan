var userModel = require('../../app/models/user.js');
var bcrypt = require('bcrypt');


module.exports = function(body, app, res, req){ //need to export for app.js to find it
    console.log("Logging in user.");
    if(!(body.usernameLogin && body.passwordLogin)){
        req.flash('message', "Error: Form was not fully filled out please fill out form completely.");
        res.redirect("/login");
        return 0;
    }
    userModel.findOne({ 'username': body.usernameLogin }, 'password username',  function (err, queredUser) {
        if (err || queredUser == null){
            console.log("Eror loggin in ");
            req.flash('message', "Error: An error has occured, please try again.");
            res.redirect("/login");
            return console.error(err);
        }else{
            console.log("loggin in" + queredUser.username);
        }
        bcrypt.compare(body.passwordLogin, queredUser.password, function(err, bool) {
            if (err){
                req.flash('message', "Error: An error has occured while trying to log you in, please try again later.");
                res.redirect("/login");
                throw (err);
            }
            if(bool){
                req.session.regenerate(function(){
                    console.log("password is correct, user has right information");
                    req.session.expires = null; //makes cookie persistant so it doesnt get killed when logging out
                    req.session.cookie.rolling = true;
                    if(body.rememberMe){
                        console.log("User wants to be noticed by node senpia"); //kill me
                        req.session.cookie.maxAge = 2592000000; //was told this was 30 days ¯\_(ツ)_/¯
                        //could set rolling to false and make maxage like one day?
                    }else{
                        req.session.cookie.maxAge = 3600000*2; //important as normal max age could be 0 or something to prevent is being saved on databas
                    }
                    req.session.user = queredUser.username;
                    req.session.userName = queredUser.username;
                    app.locals.userName;
                    userModel.findOneAndUpdate({'username': req.session.userName}, { lastloggedin: Date.now }, {upsert:true}, function(err, doc){
                        if(err) console.log(err);
                    });
                    res.redirect("/user/" + req.session.user);
                    return 1;
                });
            }else{
                req.flash('message', "Error: Password is incorrect, please try again.");
                res.redirect("/login");
            }
        });
    });
};

