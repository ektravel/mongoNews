var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Require all models
var db = require("./models");

var PORT = 3000;

//Initialize express
var app = express();

//Configure middleware

//use morgan logger for logging requests
app.use(logger("dev"));

//use body-parser for handling form submissions
app.use(bodyParser.urlencoded({extended: true}));

//use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoNews";

//Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/mongoNews");

//Routes

//A GET route for scraping the onion website 
app.get("/scrape", function(req, res){
    //grab the body of the html with request
    axios.get("https://www.theonion.com/").then(function(response){
        //load the data into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        //grab every title and h1 within a header tag
        $("article").each(function(i, element){
            //save an empty result object
            var result = {};
            //add the text and href of every link, and save them as properties of the result object
            result.title = $(this).find("header").find("a").text();
            result.link = $(this).children("header").children("h1").children("a").attr("href");
            result.summary = $(this).find("div.item__content").find(".excerpt").text();
            result.img = $(this).find("div.item__content").find("figure").find("picture").find("source").attr("data-srcset");

            //create a new Article using the "result" object built from scraping
            db.Article.create(result)
            .then(function(dbArticle){
                //view the added result in the console
                console.log(dbArticle);
            }).catch(function(err){
                //if an error occured, send it to the client
                return res.json(err);
            });
        });
        //if an Article was scraped and saved successfully, display this message
        res.send("Scrape Complete");
    });
});

//Start the server
app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});