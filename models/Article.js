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
    saved: {
        type: Boolean,
        default: false
    },
    //note is an object that stores a Note id
    notes:[ 
    {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
]
});
// Create a model from the above schema using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

//Export the Article model
module.exports = Article;