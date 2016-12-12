var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var postContent = new Schema({
    postID: String,
    title: String,
    postTime: Date,
    posterID: String, //if its not anon its his name if it is it is blank or null or trip
    posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
    boardName: String,
    totalPostID: String,
    posterCountry: String,
    subject: String,
    img: { data: Buffer, contentType: String } //required
    posts: [{
        text: String,
        postTime: Date,
        posterID: String,
        posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
        posterCountry: String,
        img: { data: Buffer, contentType: String } //https://gist.github.com/aheckmann/2408370
        // postedBy: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User' //name of schema model
        // }
    }]
});

var postContent = mongoose.model('postContents', postContent);
module.exports = thread;




/*
http://mongoosejs.com/docs/populate.html

post.save(function(error) {
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
