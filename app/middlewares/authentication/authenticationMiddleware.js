var https = require('https');
var path = require('path');
var userModel = require('../../models/user.js');
var emailTokens = require('../../models/emailTokens.js');
var boardModel = require('../../models/board.js');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var fs = require("fs");
var readChunk = require('read-chunk');
var fileType = require('file-type');




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


  /*


   */
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
