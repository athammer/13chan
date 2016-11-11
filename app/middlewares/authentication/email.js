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

}
