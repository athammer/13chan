
//https://blog.risingstack.com/node-js-security-checklist/

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var flash = require('req-flash');
var session = require('express-session');
var favicon = require('serve-favicon');
var MongoStore = require('connect-mongo')(session);





var middlewares = require("./app/middlewares/middleware.js");
var controllerLogic = require('./app/controllers/logic/controllerLogic.js');

//http://socket.io/docs/






app.set('view engine', 'ejs');
app.set('trust proxy', 1);


mongoose.connect('mongodb://admin:notasecret@ds023593.mlab.com:23593/heroku_1v04kswb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    //
});





app.use(helmet());
app.use(favicon('./public/img/favicon.png'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(session({
    name: '13chanAuth',
    genid: function(req) {
    return require('crypto').randomBytes(48).toString('hex');
    },
    rolling: true,
    secret: 'notasecret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        maxAge: 1500000,
        httpOnly: true, //http://expressjs.com/en/advanced/best-practice-security.html
        
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(middlewares.prettifyDomain);
app.use(flash());
app.use(controllerLogic.flashUsername);


require('./app/controllers/routes/boards.js')(app);
require('./app/controllers/routes/user.js')(app);
require('./app/controllers/routes/main.js')(app); //must run last as 404 page is there





app.listen(80);