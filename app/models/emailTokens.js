var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var emailTokensSchema = new Schema({
    tokenID: String,
    dateCreated: Date.now(),
    userName: String
});

var emailToken = mongoose.model('emailToken', emailTokensSchema);
module.exports = emailToken;