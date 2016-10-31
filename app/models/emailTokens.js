var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var emailTokensSchema = new Schema({
    tokenID: String,
    dateCreated: { type: Date, default: Date.now },
    userName: String,
    createdAt: { type: Date, default: Date.now },
    expireAfterSeconds: { type: Date, default: 10}
});

var emailToken = mongoose.model('emailToken', emailTokensSchema);
module.exports = emailToken;
