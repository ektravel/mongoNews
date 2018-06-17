var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var exphbs = require("express-handlebars");

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

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

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

        //grab every article
        $("article").each(function(i, element){
            //save an empty result object
            var result = {};
        
            result.title = $(this).find("header").find("h1").text();
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

//Route for the landing page
app.get("/", function(req,res){
    db.Article.find({})
    .then(function(dbArticle){
        var article = {article:dbArticle};
        res.render("index",article);
        // res.json(dbArticle);
    })
    .catch(function(err){
        console.log(err);
    });
});

// //Route for grabbing all Articles from the db
// app.get("/articles", function(req, res) {
//     db.Article.find({})
//     .then(function(dbArticle) {
//         res.json(dbArticle);
//     })
//     .catch(function(err){res.json(err);
//     });
// });

//Route for grabbing a specific Article by id
app.get("/articles/:id", function(req,res){
    //using the id from the id parameter, prepare a query that finds a match in the db
    db.Article.findOne({_id: req.params.id})
    //populate all of the notes associated with the article
    .populate("note")
    .then(function(dbArticle){
        //send the result back to the client
        res.json(dbArticle);
    }).catch(function(err) {
        res.json(err);
    });
});

//Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req,res){
    //create a new note and pass the req.body to the entry
    db.Note.create(req.body)
    .then(function(dbNote){
        return db.Article.findOneAndUpdate({_id: req.params.id}, {note:dbNote._id}, {new: true});
    }).then(function(dbArticle){
        //sent the updated Article back to the client
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});
//Start the server
app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});