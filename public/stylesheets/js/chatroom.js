$(document).ready(function(){

    var url = window.location.href;
    var vars = url.split('/');
    var id = '#' + vars[4];

    console.log(id);
    // var chatWITH = document.getElementById(vars[4]);
    $(id).addClass('active');
    console.log($(id));

             $( '#msgform' ).on( 'submitResponse', function( e, response ) {
        console.log('done');
    });

	var sendBtn = $('.sendBtn');

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

    var wtf = $('#scrolldowndiv');
                var height = wtf[0].scrollHeight;
                wtf.scrollTop(height);

    // $('#msgform').ajaxForm({
    //     url : '/chat', // or whatever
    //     dataType : 'json',
    //     success : function (response) {
    //         alert("The server says: " + response);
    //         var wtf = $('#scrolldowndiv');
    //         var height = wtf[0].scrollHeight;
    //         wtf.scrollTop(height);
    //     }
    // });         
    $("#msgform").bind('ajax:complete', function() {  
        alert("The server says: " + response);
            var wtf = $('#scrolldowndiv');
            var height = wtf[0].scrollHeight;
            wtf.scrollTop(height);
            console.log('in');
    }); 


});



