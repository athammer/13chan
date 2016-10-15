var boardModel = require('../../app/models/board.js');
var bcrypt = require('bcrypt');


module.exports = function(body, app, res, req){  //need to export for app.js to find it
    if(!(body && body.boardName && body.boardAbb)){
        req.flash('message', "Error: Form was not fully filled out please fill out form completely.");
        res.redirect("/create");
        return 0;
    }
    var regex = {
        name: /^[A-Za-z0-9_]{3,24}$/, //we should let boards have !@#$^&*() in it prob
        abbreviation: /.{1,7}/,
    };
    var nameReg = regex.email.test(body.boardName); //pretty nifty
    var abbreviationReg = regex.email.test(body.boardAbb); //pretty nifty :)))
    console.log('creating board: ' + body.boardName);
    
    
    if(!nameReg){
        console.log('name is messed up :(');
        req.flash('message', "Error: Name is in an incorrect format.");
        res.redirect("/create");
        return false;
    }
    if(!abbreviationReg){
        console.log('abb is messed up');
        req.flash('message', "Error: Abbreviation is in the wrong format.");
        res.redirect("/create");
        return false;
    }
    if(!nameReg && !abbreviationReg){
        console.log('name and abb is messed up nice job...');
        req.flash('message', "Error: Name and abbreviation is in the wrong format.");
        res.redirect("/create");
        return false;
    }
    var board = new boardModel({
        name: body.boardName,
        abbreviation: body.boardAbb,
        slogan: body.boardSlogan,
        anonymity: body.anonymity,
        nsfw: body.nsfw,
        date: Date.now(),
        threads: 0,
        posts:  0,
        owner:  req.session.userName,
        inactive:  false,
        invisible: body.invisible,
        invite: body.invite
    });
    boardModel.findOne({ 'name': body.boardName }, 'name',  function (err, queredUser) {
        if(err){
            req.flash('message', "Error: Error quering for board duplicates.");
            res.redirect("/create");
            throw(err);
        }
        
        if(queredUser == null){
            board.save(function (err, user) {
                if (err){
                    req.flash('message', "Error: Cannot save user");
                    res.redirect("/create");
                    throw(err);
                }else{
                    console.log('board created');
                    req.flash('message', "Success! Board created.");
                    var URL = 'https://b.13chan.co/' + body.boardName;
                    res.writeHead(301, { "Location":  URL });
                    res.end();
                return 1;
                }
            });
        }else{  
            console.log('board exists');
            req.flash('message', "Error: Board name already exists");
            res.redirect("/create");
        }
    });

};

