var https = require('https');
var path = require('path');
var postModel = require('../../models/postContent.js');
var userModel = require('../../models/user.js');
var emailTokens = require('../../models/emailTokens.js');
var boardModel = require('../../models/board.js');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var fs = require("fs");
var readChunk = require('read-chunk');
var fileType = require('file-type');

module.exports = {
  /*


   */
  boardNameCheck: function(req, res, boardName){
      boardModel.findOne({ 'abbreviation': boardName }, 'name abbreviation nsfw slogan',  function (err, queredBoard) {
          if (err || queredBoard == null){
              req.flash('message', 'No such user board, try again.');
              res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
              //res.status('404').render('./pages/main/404.ejs', { flashObject: req.flash('message'), userName: req.flash('user') });
              return console.error(err);
          }else{
              console.log("board exists");
              console.log("Board name: " + queredBoard);
              req.flash('boardNameF', queredBoard.name);
              req.flash('abbreviationF', queredBoard.abbreviation);
              req.flash('slogan', queredBoard.slogan);
              console.log(queredBoard.nsfw);
              if(queredBoard.nsfw == 'nsfw'){
                  res.render('./pages/boards/nsfwLegoBoard.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), boardName: req.flash('boardNameF'), abbreviation: req.flash('abbreviationF'), slogan: req.flash('slogan') });
                  return 1;
              }
              if(queredBoard.nsfw == 'swf'){
                  res.render('./pages/boards/legoBoard.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), boardName: req.flash('boardNameF'), abbreviation: req.flash('abbreviationF'), slogan: req.flash('slogan') });
                  return 1;
              }
              if(queredBoard.nsfw == 'adult'){ //unique one for adult?
                  res.render('./pages/boards/nsfwLegoBoard.ejs', { flashObject: req.flash('message'), userName: req.flash('user'), boardName: req.flash('boardNameF'), abbreviation: req.flash('abbreviationF'), slogan: req.flash('slogan') });
                  return 1;
              }else{
                  console.log("error has occured on selecting nsfw board")
                  req.flash('message', 'Error has occured on board settings.');
                  res.redirect('/');
                  return 1;
              }
              // if swf then load normal theme, if nsfw then load red, if adult then load something

              //render board here
          }
      });
      return 1;
  },


  /*


   */
  notABoard: function(req, res, next) {
      var domain = req.headers.host;
      var subDomain = domain.split('.');
      console.log(subDomain);
      console.log('host: 1' + subDomain[0]);
      console.log('host: 1' + subDomain);
      if(subDomain[0] == 'b'){
          var URL = "https://" + '13chan.co' + req.url;
          res.writeHead(301, { "Location":  URL });
          res.end();
          return 1;
      }
      next();
  },


  /*



   */
   boardPost: function(req, res, body) {
       //do stuff here dummy
       //this is going to be a long one welp.
       //could they post from a non created board???
       //a new thread post should have an extra value so you know it's not just a someone posting inside a thread
       //will also have to handle if it is anonymous how things will look vs if it's not anonymous and all the special board settings with ejs magic
       //for the images/wembs/gifs we should only allow some size and some formats? until i know what the fuck im doing?
       //should check in here if board exists first before saving it dummy
       //i'll need to do some ejs trickery to get everything working.
       //http://stackoverflow.com/questions/34437531/passing-data-from-mongo-to-ejs

       //eventualy let users increase how large the files can be? by letting people pay for extra files size so i dont go broke

       var mimeAccepted = {
           //names dont matter as for each loop will take care of it

           //JPEG + JPG
           one: 'image/jpeg',
           two: 'image/pjpeg',
           three: 'image/jpeg',
           four: 'image/jpeg',
           five: 'image/pjpeg',
           six: 'image/jpeg',
           se7en: 'image/pjpeg',
           eight: 'image/jpeg',
           nine: 'image/pjpeg',

           //PNG
           ten: 'image/png',

           //GIF
           eleven: 'image/gif',

           //WebM
           twelve: 'video/webm',
           thirteen: 'audio/webm',

           //WebP
           fourteen: 'image/webp',

           //Flif NOTE: can't find it on docs must not have one yet?
           fifteen: 'image/flif', //https://github.com/FLIF-hub/FLIF

           //Flash (might not use)
           sixteen: 'application/x-shockwave-flash'

       }

       for (var i = 0; i < mimeAccepted.length; i++) {
           if (!(mimeAccepted[i] == fileType(buffer.mime))){
             //do nothing
           }else{
               //good mime found
               var fileSize = fs.statSync(body.file);//inb4 error (will this throw error if image doesn't exist? does body.fileThread == null when doesn't exist?)
               var fileSizeInBytes = fileSize["size"];
               var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;  //might get input from the db if the board needs extra file size such as  a wallpaper board
               if(fileSizeInMegabytes > 8){
                   req.flash('message', 'File size is too large, must be under 8MBs');
                   res.redirect('back');
                   //or res.redirect(req.get('referer'));
               }else if(body.subjectThread){ //file is good size and is a thread
                   console.log("test THIS IS A THREAD YEEEEEAHAHAHAH");
                   if(body.file == null){ //checks if there is a photo, front end should not let them submit without a photo...
                     req.flash('message', 'When creating threads there must be an accepted image/video type.');
                     res.redirect('back'); //GO BACK FROM ONCE YOU CAME
                   }
                   boardModel.findOne({ 'name': body.boardName }, 'name totalCount',  function (err, queredUser) {
                      if(err){
                           req.flash('message', "Error: Error quering for board duplicates.");
                           res.redirect("/create");
                           throw(err);
                       }
                       if(body.author == null){
                         console.log("user is anon")
                       }
                       // updated docs http://mongoosejs.com/docs/documents.html


                       update = { $inc : {
                         numShown : 1,
                         'secondField.subField' : 1

                        }
                       };
                       options = {};
                       boardModel.findByIdAndUpdate('name', body.boardName, options, function(err){
                         if(err){ return console.error(err);}
                       }




                       var thread = new thread({
                         postID: totalCount + 1,
                         title: body.subjectThread,
                         postTime: Date.now(),
                         posterID: body.author, //if its not anon its his name if it is it is blank or null or trip
                         posterNumber: String, get
                       });
                   )}


               }else if(body.subjectPost){//file is a post
                   console.log("test THIS IS A POST YEEEEEAHAHAHAH");
                   var post = new post({

                     //work on post first

                   });

               }else{
                   req.flash('message', 'Bad Request, please resend.');
                   res.redirect('back');
               }
           }


           //if none was found
           req.flash('message', 'File type is not accepted');
           res.redirect('back'); //go back to where the request came from.
           return 0;

       }


       return 1;

   },
}
