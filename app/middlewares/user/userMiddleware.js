var https = require('https');
var path = require('path');
var userModel = require('../../app/models/user.js');
var emailTokens = require('../../app/models/emailTokens.js');
var threadModel = require('../../app/models/thread.js');
var postModel = require('../../app/models/post.js');
var boardModel = require('../../app/models/board.js');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var fs = require("fs");
var readChunk = require('read-chunk');
var fileType = require('file-type');


module.exports = {
  /*



   */
  userNameCheck: function(req, res, possibleUser) {
      userModel.findOne({ 'username': possibleUser }, 'username emailverified',  function (err, queredUser) {
          if (err || queredUser == null){
              req.flash('message', 'No such user exists, try again.');
              res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
              return console.error(err);
          }else{
              if(queredUser.emailverified){
                  req.session.cookie.emailVerified = true;

              }
              console.log("user exists");
              console.log(req.session.userName + " " + queredUser);
              if(req.session.userName == queredUser.username){
                  if(!req.session.cookie.emailVerified){
                      req.flash('emailVerified', 'Your email has not been verified.');

                  }
                  res.render('./pages/user/user.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), emailVerified: req.flash('emailVerified')});
              }else{
                  res.render('./pages/user/publicUser.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
              }
          }
      });
  },

};
