$(document).ready(function(){
	var id = $('#receiverId').val();

	var sendBtn = $('.sendBtn');

    sendBtn.on('click', function() {
    	var messageform = document.getElementById('sendmessage');
    	// messageform.submit();
    	$('form[name=msgform]').submit(function(){
            console.log("click");
        });
    });

    setInterval(function() {
    	// $('.messages').load(location.href + ' .messages');
    }, 200);
});