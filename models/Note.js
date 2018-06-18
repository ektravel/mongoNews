var mongoose = require("mongoose");

//Save a reference to the Schema constructor
var Schema = mongoose.Schema;

//Create a new NoteSchema using the Schema constructor
var NoteSchema = new Schema({
    body: String
});

//Create the model using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);

//Export the Note model
module.exports = Note;