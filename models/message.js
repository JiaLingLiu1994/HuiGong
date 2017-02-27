var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	body: {type: String, required: true},
	userFrom: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
	userTo: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
	userFromName: {type: String, required: true},
	userToName: {type: String, required: true},
    timestamp: {type: String, required: true}
});

module.exports = mongoose.model('message', messageSchema);
