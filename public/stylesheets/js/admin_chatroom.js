$(document).ready(function(){

    var url = window.location.href;
    var vars = url.split('/');
    var id = '#' + vars[5];
    console.log(id);
    $(id).addClass('active');

	// var sendBtn = $('#btn');

     $('#btn').on('click', function() {
        console.log("click");
    	// var messageform = document.getElementById('sendmessage');
    	// messageform.submit();
    	$('form[name=msgform]').live('submit', function(){
            console.log("send message!");
        });
    });

    setInterval(function() {
    	$('#autoFreshMsg').load(location.href+' #autoFreshMsg');
    }, 200);
});