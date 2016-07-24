var userModel = require('../../models/user.js');
var bcrypt = require('bcrypt');

module.exports = {   
    
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
    
    loginCheck: function(req, res, next){
        if (req.session.user) {
            console.log("logged in");
            res.redirect("/");
            //already logged in dummy
        }else{
            console.log("not logged in");
            next();
        }
    }
};
