var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var Note = require('./app/Model/Note.js');
var Article = require('./app/Model/Article.js');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public'));

//Database configuration
mongoose.connect('mongodb://admin:admin@ds021663.mlab.com:21663/heroku_q3z6l55v');
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('Mongoose Error: ', err);
});
db.once('open', function () {
    console.log('Mongoose connection successful.');
});

// set up handlebars for express
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    extname: '.handlebars',
    layoutsDir: 'app/views/layout'
}));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/app/views');

// load the static files
var staticContentFolder = __dirname + '/app/public';
app.use(express.static(staticContentFolder));

//routing
require("./app/routes/routes.js")(app);

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log('App running on port 3000!');
});
