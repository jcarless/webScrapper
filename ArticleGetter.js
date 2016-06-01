var request = require('request');
var cheerio = require('cheerio');
var Note = require('./app/model/Note.js');
var Article = require('./app/model/Article.js');
var articleText='';
module.exports = {
	GetArticle:function(id,callback){
		Article.findOne({
            _id: id
        })
        .populate('note')
        .exec(function(err, article) {
            if(err) {
                console.log(err);
                //res.send('error occured')
            	return callback(err);
            } else {
                request("http://www.cnbc.com/2016/05/30/feds-bullard-says-global-markets-seem-well-prepared-for-summer-rate-hike.html", function(error, response, html){
	                if(error) {
	                    console.log(error);
	                    //res.send('error occured')
	                	return callback(error);
	                } else {
	                    var $ = cheerio.load(html);
	             		var data = {articleText:'',notes:[]};
	                    $('div.group').each(function(i, element){
	                         articleText = $(this).children('p').text();
	                         data.article=article;
	                         data.articleText += articleText;                         	
		                });
//console.log("sdasdasdas " + article.note[0].body);
	                    data.notes.push(article.note[0].body);
                        return callback(null,data);
	                }
	            });
            }
        }); //exec
	}
}