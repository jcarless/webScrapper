var request = require('request');
var cheerio = require('cheerio');
var Note = require('../model/Note.js');
var Article = require('../model/Article.js');
var articleText = '';
module.exports = function(app) {


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

                    res.render('index', {
                        title: article[0].title,
                        text: articleText,
                        savedNote: article[0].note
                    });
                }

            });

    });


    app.get('/scrape', function(req, res) {
        request('http://www.cnbc.com/', function(error, response, html) {
            var $ = cheerio.load(html);
            $('h3.headline').each(function(i, element) {

                var result = {};
                var noteResult = {};

                result.title = $(this).children('a').text();
                linkRaw = $(this).children('a').attr('href');
                result.link = "www.cnbc.com" + linkRaw;




                // request("'" + result.link + "'", function(error, response, html){
                //     $ = cheerio.load(html);
                //    $('div.group').each(function(i, element){
                //        result.text = $(this).children('p').text();
                //        console.log(result);
                //
                //    })
                // });

                console.log(result);


                noteResult.title = result.title;
                noteResult.body = ' ';


                var newNote = new Note (noteResult);

                newNote.save(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(doc);
                    }
                });

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
    });


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
    });

    app.get('/notes/:id', function(req, res){

        Article.findOne({
            _id: req.params.id
        })
            .exec(function(err, article) {
                if(err) {
                    console.log(err);
                    res.send('error occured')
                } else {
                    request("http://www.cnbc.com/2016/05/30/feds-bullard-says-global-markets-seem-well-prepared-for-summer-rate-hike.html", function(error, response, html){
                        var $ = cheerio.load(html);
                        $('div.group').each(function(i, element){
                            articleText = $(this).children('p').text();
                        });

                    }); //request
                    console.log("text: " + articleText);

                    res.render('index', {
                        title: article.title,
                        text: articleText,
                        savedNote: article.note
                    });                }
            });

        app.post('/notes/id', function(req, res){
            console.log(req.params.id);
            Note.findOneAndUpdate({
                    title: req.body.title},
                {$set:
                {note: req.body.note}},
                {upsert: true},
                function(err, note){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(note);
                        res.send(note);
                    }
                }
            );


        });

    });




};