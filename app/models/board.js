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
    threadCount: Number,
    postCount:  Number,
    totalCount: Number,
    owner:  String,
    mod:  String,
    janitor:  String,
    inactive:  Boolean,
    invisible: Boolean,
    invite: Boolean,

    threads: [{ //threads
      postID: String,
      title: String,
      postTime: Date,
      posterID: String, //if its not anon its his name if it is it is blank or null or trip
      posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
      boardName: String,
      totalPostID: String,
      posterCountry: String,
      text: String,
      img: { data: Buffer, contentType: String }, //required

      //ouch, well see if this is even possible...
      posts: [{ //posts in the thread
        text: String,
        postTime: Date,
        posterID: String,
        posterNumber: String, //random number generate from cookie and ip address given, should i even do this why not put it in posterID???
        posterCountry: String,
        img: { data: Buffer, contentType: String } //https://gist.github.com/aheckmann/2408370
      }],
    }],
});

var board = mongoose.model('board', boardSchema);
module.exports = board;

//https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/
//http://mongoosejs.com/docs/populate.html
//http://stackoverflow.com/questions/8737082/mongoose-schema-within-schema
