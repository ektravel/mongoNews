//Require mongoose
var mongoose = require("mongoose");

//Get a reference to the mongoose Schema constructor
var Schema = mongoose.Schema;

//Using the Schema constructor, create a new UserSchema object
var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    //note is an object that stores a Note id
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});
// Create a model using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

//Export the Article model
module.exports = Article;