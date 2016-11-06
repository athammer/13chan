var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var emailTokensSchema = new Schema({
    tokenID: String,
    dateCreated: { type: Date, default: Date.now },
    userName: String,
    createdAt: { type: Date, expires: 2592000 }, //one month will only activate when database is reset
});

var emailToken = mongoose.model('emailToken', emailTokensSchema);
module.exports = emailToken;
