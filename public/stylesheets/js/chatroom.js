$(document).ready(function(){

    var url = window.location.href;
    var vars = url.split('/');
    var id = '#' + vars[4];

    console.log(id);
    // var chatWITH = document.getElementById(vars[4]);
    $(id).addClass('active');
    console.log($(id));

	var sendBtn = $('.sendBtn');

    sendBtn.on('click', function() {
    	var messageform = document.getElementById('sendmessage');
        
    	$('form[name=msgform]').submit(function(event){
            event.preventDefault();
            console.log("send message!");
            // setTimeout(function() {
            //     $('#msg_body').val('');
            // }, 0.000000000000000000000000000000000000001);
        });
    });
    
    setInterval(function() {
    	$('#autoFreshMsg').load(location.href+' #autoFreshMsg');
    }, 200);
});