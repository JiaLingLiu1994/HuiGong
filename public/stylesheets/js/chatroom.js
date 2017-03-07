$(document).ready(function(){

    var url = window.location.href;
    var vars = url.split('/');
    var id = '#' + vars[4];

    console.log(id);
    // var chatWITH = document.getElementById(vars[4]);
    $(id).addClass('active');

    $( '#msgform' ).on( 'submitResponse', function( e, response ) {
        console.log('done');
    });

    $('#btn').on('click', function() {
    	var messageform = document.getElementById('sendmessage');
        
    	$('form[name=msgform]').submit(function(event){
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