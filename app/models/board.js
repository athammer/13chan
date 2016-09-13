var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var userSchema = mongoose.Schema({

var boardSchema = new Schema({
    name: String,
    abbreviation: String,
    slogan: String,
    anonymity: String,
    nsfw: String,
    tags: String,
    date: { type: Date, default: Date.now },
    threads: Number,
    posts:  Number,
    owner:  String,
    mod:  String,
    janitor:  String,
    inactive:  Boolean,
    postcontent: Schema.ObjectId //http://stackoverflow.com/questions/8737082/mongoose-schema-within-schema
});

var board = mongoose.model('board', boardSchema);
module.exports = board;