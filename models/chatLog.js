var mongoose = require('mongoose');

var chatLogSchema = new mongoose.Schema({
    timestamp: {
        type: String,
        required: true,
        unique: true
    },
    nickname: String,
    reciever: String,
    message: String
});

module.exports = mongoose.model('chat_log', chatLogSchema);
