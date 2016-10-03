var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var emailTokensSchema = new Schema({
    tokenID: String,
    dateCreated: { type: Date, default: Date.now },
    userName: String,
    createdAt: { type: Date, expires: 2592000, default: Date.now }
});

var emailToken = mongoose.model('emailToken', emailTokensSchema);
module.exports = emailToken;
