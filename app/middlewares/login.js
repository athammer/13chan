var userModel = require('../../app/models/user.js');
var bcrypt = require('bcrypt');


module.exports = function(body, app, res, req){ //need to export for app.js to find it
    console.log("Logging in user.");

    userModel.findOne({ 'username': body.usernameLogin }, 'password username',  function (err, queredUser) {
        if (err || queredUser == null){
            console.log("Eror loggin in ");
            res.redirect("/login");
            return console.error(err);
        }else{
            console.log("loggin in" + queredUser.username);
        }
        bcrypt.compare(body.passwordLogin, queredUser.password, function(err, bool) {
            if (err)
                throw (err);
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
                    res.redirect("/user/" + req.session.user);
                });
            }else{
                console.log("password is incorrect: " + queredUser.password);
            }
        });
    });
};