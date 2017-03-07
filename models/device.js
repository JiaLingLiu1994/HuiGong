var mongoose = require('mongoose');
 
var Schema = mongoose.Schema;
 
var deviceSchema = mongoose.Schema({ 
 
    deviceName         : String,
    deviceId        : String, 
    registrationId    : String,
    username        : String,
    name            :String
 
});
 
module.exports = mongoose.model('device', deviceSchema);