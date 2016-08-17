var boardModel = require('../../app/models/board.js');
var bcrypt = require('bcrypt');


module.exports = function(body, app, res, req){  //need to export for app.js to find it
    if(!(body && body.boardName && body.boardAbb)){
        req.flash('message', "Error: Form was not fully filled out please fill out form completely.");
        res.redirect("/create");
        return 0;
    }
    console.log('creating board: ' + body.boardName);
    var board = new boardModel({
        name: body.boardName,
        abbreviation: body.boardAbb,
        anonymity: body.anonymity,
        nsfw: body.nsfw,
        date: Date.now,
        threads: 0,
        posts:  0,
        owner:  req.session.userName,
        inactive:  false
    });
    boardModel.findOne({ 'name': body.boardName }, 'name',  function (err, queredUser) {
        if(err){
            req.flash('message', "Error: Error quering for board duplicates.");
            res.redirect("/create");
            throw(err);
        }
        
        if(queredUser != null){
            board.save(function (err, user) {
                if (err){
                    req.flash('message', "Error: Cannot save user");
                    res.redirect("/create");
                    throw(err);
                }else{
                    console.log('board created');
                    req.flash('message', "Success! Board created.");
                    var URL = 'https:/b.13chan.co/' + body.boardName;
                    res.writeHead(301, { "Location":  URL });
                    res.end();
                return 1;
                }
                
            });
        }else{  
            req.flash('message', "Error: Board name already exists");
            res.redirect("/create");
        }
    });

};

