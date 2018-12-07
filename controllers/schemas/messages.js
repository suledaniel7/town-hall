const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let messageSchema = new Schema({
    sender: {type: String, required: true},
    sender_name: {type: String, required: true},
    sender_position: String,
    sender_avatar: {type: String, required: true},
    m_timestamp: {type: String, unique: true, required: true},
    timestamp: {type: Number, required: true},
    message: {type: String, required: true},
    date_created: {type: String, required: true},
    time_created: {type: String, required: true},
    ac_type: {type: String, required: true},
    beats: {type: Array, required: true},
    m_type: {type: String},
    tags: Array,
    mentions: Array,
    comments_no: Number,
    verified: Boolean
    // date: Date
});

// messageSchema.pre('save', function(next){
//     let today = new Date();
//     this.date = today;
//     next();
// });

let messages = mongoose.model('messages', messageSchema);

module.exports = messages;