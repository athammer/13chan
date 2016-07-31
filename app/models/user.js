var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    question: String,
    answer: String,
    date: { type: Date, default: Date.now },
    forumposts: Number,
    timespent:  Number,  //will be in hours then converted to monhts/minutes blah blah
    createdboards: [String],
    subbedboards: [String],
    permission: String,
    lastloggedin: { type: Date, default: Date.now },
    emailverified: Boolean
});

var users = mongoose.model('user', userSchema);
module.exports = users;