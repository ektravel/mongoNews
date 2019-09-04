var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var exphbs = require("express-handlebars");

//Scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

//Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

//Initialize express
var app = express();

//Configure middleware

//use morgan logger for logging requests
app.use(logger("dev"));

//use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

//use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoNews";

//Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

//Routes

//test code to get the app to display articles
app.get("/scrape", function (req, res) {
    axios.get("https://www.theonion.com/")
        .then(function (response) {
            //load the data into cheerio and save it to $ for a shorthand selector
            const $ = cheerio.load(response.data);
            //iterate over a cheerio object, executing a function for each matched element
            $("article").each(function (i, elem) {
                const result = {};
                //get article title
                result.title = $(this).find("a").find("h1").text();
                //get article link
                result.link = $(this).find("figure").children("a").attr("href");
                //get article summary
                result.summary = $(this).find("p", "#text").text();

                //create a new Article using the "result" object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        //view the added result in the console
                        console.log(dbArticle);
                    }).catch(function (err) {
                        //if an error occured, send it to the client
                        console.log(res.json(err));
                        return res.json(err);
                    });
            });

        })
        .catch(function (error) {
            //handle error
            console.log(error);
        });
})

//Route for the landing page
app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            var article = { article: dbArticle };
            res.render("index", article);
            // res.json(dbArticle);
        })
        .catch(function (err) {
            console.log(err);
        });
});

//Route for loading all saved articles
app.get("/saved", function (req, res) {
    db.Article.find({
        saved: true
    })
        .then(function (dbArticle) {
            var hbsObject = { article: dbArticle };
            res.render("savedArticles", hbsObject);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//Route for grabbing a specific Article and its notes by id
app.get("/articles/:id", function (req, res) {
    //using the id from the id parameter, prepare a query that finds a match in the db
    db.Article.findOne({ _id: req.params.id })
        //populate all of the notes associated with the article
        .populate("notes")
        .then(function (dbArticle) {
            //send the result back to the client
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
});

//Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    //create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
        }).then(function (dbArticle) {
            //send the updated Article back to the client
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
});

//Route for saving an article
app.post("/savearticle/:id", function (req, res) {
    db.Article.findByIdAndUpdate({ _id: req.params.id }, {
        saved: true
    }).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});

//Route to delete a saved article
app.post("/deletearticle/:id", function (req, res) {
    db.Article.findByIdAndUpdate({ _id: req.params.id }, {
        saved: false
    }).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});

//Route to delete a note
app.post("/deletenote/:id", function (req, res) {
    db.Note.findByIdAndRemove({ _id: req.params.id })
        .then(function (dbNote) {
            res.json(dbNote);
        }).catch(function (err) {
            res.json(err);
        });
});

//Route to clear all records
app.get("/crearall", function (req, res) {
    db.Article.remove({})
        .then(function () {
            res.send("All records have been deleted.");
        }).catch(function (err) {
            res.json(err);
        });
});

//Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});