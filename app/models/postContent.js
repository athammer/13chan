var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var postContent = new Schema({
  //empty for now so the i dont have to delete paths(aka lazy rn)




    // postID: String,
    // title: String,
    // postTime: Date,
    // posterID: String, //if its not anon its his name if it is it is blank or null or trip
    // posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
    // boardName: String,
    // totalPostID: String,
    // posterCountry: String,
    // text: String,
    // img: { data: Buffer, contentType: String }, //required
    // posts: [{ //posts in the thread
    //     text: String,
    //     postTime: Date,
    //     posterID: String,
    //     posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
    //     posterCountry: String,
    //     img: { data: Buffer, contentType: String } //https://gist.github.com/aheckmann/2408370
    // }],
    // // parentBoard: { //don't need
    // //     type: mongoose.Schema.Types.ObjectId,
    // //     ref: 'board' //name of schema model
    // // }
});

var postContent = mongoose.model('postContents', postContent);
module.exports = postContent;




/*
https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/
http://mongoosejs.com/docs/populate.html

postContent.save(function(error) {
    if (!error) {
        Post.find({})
            .populate('postedBy')
            .populate('comments.postedBy')
            .exec(function(error, posts) {
                console.log(JSON.stringify(posts, null, "\t"))
            })
    }
});
 */
