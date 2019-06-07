const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let convoSchema = new Schema({
    sender: {type: String, required: true},
    sender_name: {type: String, required: true},
    sender_position: {type: String, required: true},
    sender_avatar: {type: String, required: true},
    text: {type: String, required: true},
    c_timestamp: {type: String, unique: true, required: true},
    timestamp: {type: Number, required: true},
    date_created: {type: String, required: true},
    time_created: {type: String, required: true},
    l_code: {type: String, required: true}
});

let conversation = mongoose.model('conversations', convoSchema);

module.exports = conversation;