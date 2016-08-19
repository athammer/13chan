
module.exports = {
    
    flashAll: function(req, res, next) {
        console.log('flash ' + req.headers.host + '  ' + req.session.userName + '   ' + req.method  + ' vs ' + req.session.user + '   ' + req.sessionID + '   ');
        if (req.method === 'GET') { 
            if(typeof req.session.userName != 'undefined'){
                req.flash('user', req.session.userName);
            }
            //req.flash('message', 'test');
        }
        next();
    },
    clearFlash: function(req, res, next) {
        if (req.method === 'GET') { 
            req.flash('message', null);
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
    }
}