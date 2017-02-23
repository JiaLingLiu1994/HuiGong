// Get the modal
var modal = document.getElementById('newPostModal');

// Get the button that opens the modal
var btn_new = document.getElementById("btn-new");

var btn_back = document.getElementById("btn-back");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn_new.onclick = function() {
    modal.style.display = "block";
}

btn_back.onclick = function() {
	modal.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

$(document).ready(function(){
    var spanSubmit = $('.submit-span');

    spanSubmit.on('click', function() {
        var formname = this.id;
        var form = document.getElementById(formname);
        form.submit();
        // $("form[name=formname]").submit();
        console.log(this.id);
        console.log("click");
    });
});
