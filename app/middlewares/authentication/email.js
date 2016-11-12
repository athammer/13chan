var https = require('https');
var path = require('path');
var userModel = require('../../app/models/user.js');
var emailTokens = require('../../app/models/emailTokens.js');
var threadModel = require('../../app/models/thread.js');
var postModel = require('../../app/models/post.js');
var boardModel = require('../../app/models/board.js');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var nodemailer = require('nodemailer');
var fs = require("fs");
var readChunk = require('read-chunk');
var fileType = require('file-type');


module.exports = {
  sendEmailVerification: function(req, res) {
      if(req.session.userName){
          emailTokens.remove({ 'userName': req.session.userName }, function (err) {
              if(err){
                  req.flash('message', 'Error finding username for userModel when deleting old tokens.');
                  res.status('404');
                  throw err;
              }
          });
          userModel.findOne({ 'username': req.session.userName }, 'email',  function (err, queredUser) {
              if(err){
                  throw err;
              }
              require('crypto').randomBytes(48, function(err, buffer) {
                  var token = buffer.toString('hex');
                  if(err){
                      throw err;
                  }
                  var email = new emailTokens({
                      tokenID: token,
                      dateCreated: Date.now(),
                      userName: req.session.userName,
                  });
                  email.save(function (err, user) {
                      if(err){
                          throw(err);
                      }
                      var mailOptions = {
                          from: '"13chan- Do not respond" <DoNotRespond@13chan.co>', // sender address
                          to: queredUser.email, // list of receivers
                          subject: '13chan- Email Verification ', // Subject line
                          //text: 'visit this url to verifiy your account. ' + 'https://13chan.co/emailVerification/' + token, // plaintext body
                          html: 'visit this url to verifiy your account. you have 30 days till it expires. You were send this email becuase you(hopefully) requested you needed a new token. 🐴' + 'https://13chan.co/emailVerification/' + token
                      };

                      // send mail with defined transport object

                      var smtpConfig = {
                          host: 'smtp.zoho.com',
                          port: 465,
                          secure: true, // use SSL
                          auth: {
                              user: 'DoNotRespond@13chan.co',
                              pass: process.env.DONOTRESPOND_EMAIL_PASS
                          }
                      };
                      var transporter = nodemailer.createTransport(smtpConfig);
                      transporter.sendMail(mailOptions, function(error, info){
                          if(error){
                              throw error;
                          }
                          console.log('Message sent: ' + info.response);
                          req.flash('message', 'Email sent. If you did not get an email you probably mistyped in. Go to account settings and change your email to the correct one.');
                          res.redirect('/');
                          //we did it :DD
                      });
                  });
              });
          });
      }else{
          req.flash('message', 'You must be logged in to send verification emails dummy!');
          res.status('404');
      }
      return 1;
  },


  /*



   */
   checkEmailToken: function(req, res, token) {
       emailTokens.findOne({ 'tokenID': token }, 'tokenID dateCreated userName',  function (err, queredUser) {
           var userNameTest = queredUser.userName;
           console.log(queredUser.userName + ' username!!');
           //if it is a bad token it just gives me a 502 bad gateway error
           if (err || queredUser == null){
               req.flash('message', 'No such token exists please resend verification email.');
               res.status('404');
               throw err;
           }
           //put in a if token it older then 30 days delete it and tell them to hurry their ass up when verifiying....

           //finaly not putting it in else statements for no reason :D
           console.log()
           userModel.findOneAndUpdate({'username': queredUser.userName}, { emailverified: true }, {upsert:true}, function(err, doc){
               if(err){
                   req.flash('message', 'Error finding username for userModel');
                   res.status('404');
                   throw err;
               }
               emailTokens.remove({ 'tokenID': token }, function (err) {
                   if(err){
                       req.flash('message', 'Error finding username for userModel');
                       res.status('404');
                       throw err;
                   }
               });
           });
       });
       req.flash('message', 'Email has been verified, (hopefully)');
       res.redirect('/');
       return 1;
   },

   /*



    */
    changeEmail: function(req, res, body){
        if(!(req.session.user)){
            req.flash('message', 'Error: Not logged in, please login and try again.');
            res.redirect('/');
            return 0;
        }
        if(!(body.newEmail && body.password)){
            req.flash('message', 'Error: All fields were not filled please try again.');
            res.redirect('/user/' + req.session.userName + '/emailChange');
            return false;
        }
        userModel.findOne({ 'username': req.session.userName }, 'password',  function (err, queredUser) {
            if (err){
                console.log(err);
                req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                res.redirect('/user/' + req.session.userName + '/emailChange');
            }
            bcrypt.compare(body.password, queredUser.password, function(err, bool) {
                if (err){ //i should make this less copypasta
                    console.log(err);
                    req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                    res.redirect('/user/' + req.session.userName + '/emailChange');
                }
                if(bool){
                    console.log('good password');
                    bcrypt.hash(body.newEmail, saltRounds, function(err, hash) {
                        if(err){
                            throw err;
                        }
                        var newEmail = hash;
                        userModel.findOneAndUpdate({'username': req.session.userName}, { email: newEmail }, {upsert:false}, function(err, doc){
                            if (err){
                                console.log(err);
                                req.flash('message', 'Error has occured trying to change your email, run for the hills or try again.');
                                res.redirect('/user/' + req.session.userName + '/emailChange');
                            }else{
                                req.flash('message', 'Email successfully changed to ' + body.newEmail + '. Please reverifiy it!');
                                userModel.findOneAndUpdate({'username': req.session.userName}, { emailverified: false }, {upsert:false}, function(err, doc){
                                    if(err){
                                        throw err;
                                    }

                                });

                                //wow boy this copy pasta
                                emailTokens.remove({ 'userName': req.session.userName }, function (err) {
                                    if(err){
                                        req.flash('message', 'Error finding username for userModel when deleting old tokens.');
                                        res.status('404');
                                        throw err;
                                    }
                                });
                                require('crypto').randomBytes(48, function(err, buffer) {
                                    var token = buffer.toString('hex');
                                    if(err){
                                        throw err;
                                    }
                                    var email = new emailTokens({
                                        tokenID: token,
                                        dateCreated: Date.now(),
                                        userName: req.session.user,
                                        createdAt: Date.now()
                                    });
                                    email.save(function (err, user) {
                                        if(err){
                                            throw(err);
                                        }
                                        var mailOptions = {
                                            from: '"13chan- Do not respond" <DoNotRespond@13chan.co>', // sender address
                                            to: body.newEmail, // list of receivers
                                            subject: '13chan- Email Verification ', // Subject line
                                            //text: 'visit this url to verifiy your account. ' + 'https://13chan.co/emailVerification/' + token, // plaintext body
                                            html: 'visit this url to verifiy your account. you have 30 days till it expires. You were send this email becuase you(hopefully) requested you needed a new token. 🐴' + 'https://13chan.co/emailVerification/' + token
                                        };

                                        // send mail with defined transport object

                                        var smtpConfig = {
                                            host: 'smtp.zoho.com',
                                            port: 465,
                                            secure: true, // use SSL
                                            auth: {
                                                user: 'DoNotRespond@13chan.co',
                                                pass: process.env.DONOTRESPOND_EMAIL_PASS
                                            }
                                        };
                                        var transporter = nodemailer.createTransport(smtpConfig);
                                        transporter.sendMail(mailOptions, function(error, info){
                                            if(error){
                                                throw error;
                                            }
                                            console.log('Message sent: ' + info.response);
                                            return true;
                                            //we did it :DD
                                        });
                                    });
                                });
                                    res.redirect('/user/' + req.session.userName);
                                    return true;
                            }
                        });
                    });
                }else{
                    req.flash('message', 'Password is incorrect please try again!');
                    res.redirect('/user/' + req.session.userName + '/emailChange');
                    return false;
                }
            });
        });
    },

};
