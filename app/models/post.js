var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var postSchema = new Schema({
    postID: String,
    postTime: Date,
    posterID: String, //if its not anon its his name if it is it is blank or null or trip
    posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
    boardName: String,
    totalPostID: String,
    posterCountry: String,
});

var post = mongoose.model('posts', postSchema);
module.exports = post;