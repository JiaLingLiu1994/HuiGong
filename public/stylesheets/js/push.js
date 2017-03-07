var app =   angular.module('Push', ['ngMaterial']);
 
var socket = io();
 
app.controller('pushController', function($scope,$window,$http,$mdDialog,$mdToast) {
 
socket.on('update', function (data) {
 
    socket.emit('update','ACK from Client !');
 
    if (data.update) {
 
        getDevices();
    }
});
 
getDevices();
 
function getDevices(){
 
    $http.get('/devices').then(function(response){
 
        $scope.devices = response.data;
        $scope.deviceCount = response.data.length;
 
    });
}
 
function deleteDevice(index,devices) {
 
    var registrationId = $scope.devices[index].registrationId;
 
    $http.delete('/devices/'+registrationId).then(function(response) {
 
        if (response.data.result == 'success') {
 
            devices.splice(index,1);
            $scope.deviceCount = devices.length;
 
        }
 
    })
 
};
 
$scope.showDeleteConfirmDialog = function(ev,index,devices) {
 
    var deviceName = $scope.devices[index].deviceName;
 
    var confirm = $mdDialog.confirm()
          .title('刪除裝置 !')
          .textContent('確定要刪除 ' +deviceName +' ?')
          .targetEvent(ev)
          .ok('刪除')
          .cancel('取消');
 
    $mdDialog.show(confirm).then(function() {
 
      deleteDevice(index,devices);
 
    }, function() {
 
      console.log('取消');
 
    });
};
 
$scope.showSendMessageDialog = function(ev,index) {
 
    var confirm = $mdDialog.prompt()
          .title('傳送訊息到 '+ $scope.devices[index].deviceName)
          .textContent('請輸入內容並且點選傳送訊息')
          .placeholder('你好 !')
          .targetEvent(ev)
          .ok('傳送訊息')
          .cancel('取消');
 
    $mdDialog.show(confirm).then(function(result) {
 
        $scope.progress = true;
        var message = result;
        var registrationId = $scope.devices[index].registrationId;
          console.log('okay'+ message +registrationId);
 
          var params = {
 
              message:message,
              registrationId:registrationId
          };
 
          $http.post('/send', params).then(function(response) {
 
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