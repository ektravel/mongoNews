//Scrape new articles
$(document).on("click", "#scrapeBtn", function(){
    $.ajax({
        method: "GET",
        url:"/scrape"
        }).then(function(){
            window.location = "/";
    });
});

//Remove an article from saved
$(document).on("click",".deleteArticleBtn", function(){
    var thisId = $(this).attr("data-id");
    $.ajax({
        method:"POST",
        url:"/deletearticle/" + thisId
    }).then(function(){
        $("#" + thisId).slideUp();
    });
});

//Update/Add a note when saveNote button is clicked
$(document).on("click", "#saveNote", function(){
    //Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    //Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method:"POST",
        url:"/articles/" + thisId,
        data:{
            //Value taken from note text area
            body: $("#bodyinput").val()
            }
    }).then(function(data){
        console.log(data);
        window.location = "/saved";
    });
    //Remove the values entered in the title and body textare for note entry
    $("#bodyinput").val("");
});

//Function to fill in the notes modal with notes for an article
function getNotes(thisId){
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    }).then(function(data){
        console.log(data);
        //Empty the Notes section
        var notesPlaceholder = $("#displayNotes");
        notesPlaceholder.empty();

        if(data.notes.length < 1){
            console.log('No notes found');
            notesPlaceholder.append("<div>No notes to display</div>")
        }
        else{
            console.log('Notes found: ' + data.notes.length);

            for(var i = 0; i < data.notes.length; i++){
                var noteHtml = createHtmlForNote(data.notes[i]);
                notesPlaceholder.append(noteHtml);
            }
        }
        $("#saveNote").attr("data-id", thisId);
        $("#notesModal").modal();
    });
}

function createHtmlForNote(note){
    var noteContainer = $("<div>").addClass("card bg-light mb-2");
    noteContainer.attr("id", note._id);
    var noteText = $("<div>").addClass("card-body").text(note.body);

    // Build our delete button
    var delButton = $("<button>").addClass("btn btn-danger btn-sm py-0 float-right deleteNoteBtn");
    delButton.attr("data-id", note._id);
    delButton.attr("onclick", "deleteNote('" + note._id + "')");
    delButton.text("Delete");
    // Put it all together and append to the DOM
    noteText.append(delButton);
    noteContainer.append(noteText);
    
    return noteContainer;
}



//Show all notes for one article
// "/articles/:id"
$(document).on("click", ".showNotesBtn", function(){
    var thisId = $(this).attr("data-id");
    getNotes(thisId);
});

//Delete a note
function deleteNote(noteId){
    //var noteId = deleteButton.attr("data-id");
    $.ajax({
        method:"POST",
        url: "/deletenote/" + noteId,
    }).then(function(){
        $("#" + noteId).slideUp();
    });
}

//Save an article
$(document).on("click", "#saveArticleBtn", function(){
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/savearticle/" + thisId,
    }).then(function(){
        $("#" + thisId).slideUp();
    });
});

//Clear all records (drop DB)
$(document).on("click", "#dropDB", function(){
    $.ajax({
        method: "GET",
        url:"/crearall"
        }).then(function(){
            window.location = "/";
    });
});



