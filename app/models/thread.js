var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var threadSchema = new Schema({
    postID: String,
    postTime: Date,
    posterID: String, //if its not anon its his name if it is it is blank or null or trip
    posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
    boardName: String,
    totalPostID: String,
    posterCountry: String,
    subject: String, //only difference from post.js for now
    postcontent: Schema.ObjectId
});

var thread = mongoose.model('post', threadSchema);
module.exports = thread;