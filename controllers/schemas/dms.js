const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dmSchema = new Schema({
    sender: {type: String, required: true},
    sender_name: {type: String, required: true},
    sender_avatar: {type: String, required: true},
    recepient: {type: String, required: true},
    recepient_name: {type: String, required: true},
    recepient_avatar: {type: String, required: true},
    timestamp: {type: Number, required: true},
    d_timestamp: {type: String, required: true, unique: true},
    text: {type: String, required: true},
    time_sent: {type: String, required: true},
    date_sent: {type: String, required: true}
});

const dm = mongoose.model('dms', dmSchema);

module.exports = dm;