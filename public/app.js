//Scrape new articles
$(document).on("click", "#scrapeBtn", function(){
    $.get("/scrape", function(data){
        
    })
});

//Show all saved articles
// $.get("/saved", function(data){

// })

//Remove an article from saved
$(document).on("click","#deleteArticleBtn", function(){
    var thisId = $(this).attr("data-id");
    $.ajax({
        method:"POST",
        url:"/deletearticle/" + thisId
    }).then(function(){
        $("#" + thisId).slideUp
    })

})



//Show all notes for one article
// "/articles/:id"
$(document).on("click", "#seeNotesBtn", function(){
    var thisId = $(this).attr("data-id");
    getNotes(thisId);
});


//Update/Add a note when saveNote button is clicked
// "/articles/:id"
$(document).on("click", "#saveNote", function(){
    //Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    //Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method:"POST",
        url:"/articles" + thisId,
        data:{
            //Value taken from note title area
            title: $("#titleinput").val(),
            //Value taken from note text area
            body: $("#bodyinput").val()
            }
    }).then(function(data){
        console.log(data);
        getNotes(thisId);
    });
        //Remove the values entered in the title and body textare for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

//Delete a note
"/deletenote/:id"


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


//})


