var request = require('request');
var cheerio = require('cheerio');
var Note = require('../model/Note.js');
var Article = require('../model/Article.js');
module.exports = function(app) {
    var articleText;


    app.get('/notes', function(req, res){
        Article.find({})
            .populate('body')
            .exec(function(err, article) {
                if(err) {
                    res.send('error occured')
                } else {
                    console.log(article[0]._id);
                    var articleLink = article[0].link;

                    request("http://www.cnbc.com/2016/05/30/feds-bullard-says-global-markets-seem-well-prepared-for-summer-rate-hike.html", function(error, response, html){
                        var $ = cheerio.load(html);
                        $('div.group').each(function(i, element){
                            articleText = $(this).children('p').text();
                        });

                    }); //request
                    console.log("text: " + articleText);

                    // res.render('index', {
                    //     title: article[0].title,
                    //     text: articleText,
                    //     savedNote: article[0].note
                    // });
                }

            });

    }); //get


    app.get('/scrape', function(req, res) {
        request('http://www.cnbc.com/', function(error, response, html) {
            var $ = cheerio.load(html);
            $('h3.headline').each(function(i, element) {

                var result = {};
                var noteResult = {};

                result.title = $(this).children('a').text();
                linkRaw = $(this).children('a').attr('href');
                result.link = "www.cnbc.com" + linkRaw;


                console.log(result);


                // noteResult.title = result.title;
                // noteResult.body = ' ';
                //
                //
                // var newNote = new Note (noteResult);
                //
                // newNote.save(function(err, doc) {
                //     if (err) {
                //         console.log(err);
                //     } else {
                //         console.log(doc);
                //     }
                // });

                var entry = new Article (result);

                entry.save(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(doc);
                    }
                });

            }); //each
        }); //request
        res.redirect('/')
    }); //get


    app.get('/', function(req, res){
        var headlines = [];
        Article.find({})
            .exec(function(err, article){
                for(var i = 0; i < article.length; i++){
                    headlines.push({title: article[i].title, id: article[i]._id});
                }
                res.render('articlelist', {
                    headline: headlines
                });
                console.log(headlines);
            });
    }); //get

    app.get('/notes/:id', function(req, res){
        Article.findOne({
            _id: req.params.id
        })
        .populate('note')
        .exec(function(err, article) {
            if(err) {
                console.log(err);
                //res.send('error occured')
                return callback(err);
            } else {
                var url = article.link;
                console.log('url: ' + url);
                request("http://www.cnbc.com/2016/05/30/feds-bullard-says-global-markets-seem-well-prepared-for-summer-rate-hike.html", function(error, response, html){
                    if(error) {
                        console.log(error);
                        //res.send('error occured')
                        return callback(error);
                    } else {
                        var $ = cheerio.load(html);
                        var data = {articleText:'',notes:[]};
                        data.article=article;
                        $('div.group').each(function(i, element){
                             articleText = $(this).children('p').text();
                             data.articleText += articleText;                           
                        });
                        if(article.note.length > 0) {
                            data.notes.push(article.note[0].body);

                            console.log(article.note[0].body);
                            console.log(article.note.length);
                            console.log(data.notes);
                        }
                        res.render('index', {
                            title: data.article.title,
                            text: data.articleText,
                            savedNote: data.notes
                            });
                    }
                }); //request
            } //if/then/else
        }); //exec
    });

    app.post('/notes/:id', function(req, res){

        var newNote = new Note(req.body);
        console.log(req.body);
        //Save the new note
        newNote.save(function(err, doc) {
            console.log('doc');
            console.log(doc);
            if (err) {
                res.send(err);
            } else {
                //Find our user and push the new note id into the User's notes array
                Article.findOneAndUpdate({}, {$push: {'note': doc._id}}, {new: true}, function(err, doc) {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log(err);
                        res.send(doc);
                    }
                });
            }
        });
    });



};