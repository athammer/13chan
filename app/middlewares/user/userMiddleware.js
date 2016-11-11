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
}
