const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let commentSchema = new Schema({
    comment: {type: String, required: true},
    sender: {type: String, required: true},
    sender_name: {type: String, required: true},
    sender_avatar: {type: String, required: true},
    verified: {type: Boolean, required: true},
    isUser: {type: Boolean, required: true},
    timestamp: {type: Number, required: true},
    m_timestamp: {type: String, required: true},
    c_timestamp: {type: String, unique: true, required: true},
    c_type: {type: String, required: true},
    ac_type: {type: String, required: true},
    comments_no: {type: Number, required: true},
    date_created: {type: String, required: true},
    time_created: {type: String, required: true},
    tags: Array
});

let comments = mongoose.model('comments', commentSchema);

module.exports = comments;