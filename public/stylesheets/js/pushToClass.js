var app =   angular.module('Push', ['ngMaterial']);
 
var socket = io();
 
app.controller('pushController', function($scope,$window,$http,$mdDialog,$mdToast) {
 
socket.on('update', function (data) {
 
    socket.emit('update','ACK from Client !');
 
    if (data.update) {
 
    }
});
 
$scope.showSendMessageDialog = function(ev,index) {
    var confirm = $mdDialog.prompt()
          .title('傳送訊息')
          .textContent('請輸入內容並且點選傳送訊息')
          .placeholder('你好 !')
          .targetEvent(ev)
          .ok('傳送訊息')
          .cancel('取消');
 
    $mdDialog.show(confirm).then(function(result) {
        
        $scope.progress = true;
        var message = result;
        //var registrationId = $scope.devices[index].registrationId;
          //console.log('okay'+ message +registrationId);
            console.log(className);
          var params = {
 
              message:message,
              //registrationId:registrationId
          };
 
          $http.post('/sendToClass', params).then(function(response) {
          
              $scope.progress = false;
 
              showAlert(ev,response.data.message);
 
            },function(response){
 
                console.log(response);
 
            });
 
    }, function() {
 
      console.log('cancel');
 
    });
};
 
function showAlert(ev,message) {
 
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('Alert !')
        .textContent(message)
        .ariaLabel('Alert Dialog')
        .ok('Okay')
        .targetEvent(ev)
    );
}
 
});

