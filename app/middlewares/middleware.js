var https = require('https');
var userModel = require('../../app/models/user.js');

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
                res.render('./pages/user/user.ejs', { userName: req.flash('user') });
            }
        });
    },
    
    verifyRecaptcha: function(key, callback) { //https://jaxbot.me/articles/new-nocaptcha-recaptcha-with-node-js-express-12-9-2014 tytyty
        https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + '6LfSMiUTAAAAACcrOsOUnyCJGfPlxvQSeI3jK80m' + "&response=" + key, function(res) {
            var data = ""; //will change 6LfSMiUTAAAAACcrOsOUnyCJGfPlxvQSeI3jK80m for production as it's a secret key
            res.on('data', function (chunk) {
                            data += chunk.toString();
            });
            res.on('end', function() {
                try {
                    var parsedData = JSON.parse(data);
                    console.log(parsedData);
                    callback(parsedData.success);
                } catch (e) {
                    callback(false);
                }
            });
        });
    } //not implemtned yet
}

//req.headers['host'] for domain with www.
//req.hostname without www
//var requestedUrl = req.protocol + '://' + req.get('Host') + req.url;