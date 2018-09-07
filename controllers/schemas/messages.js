const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let messageSchema = new Schema({
    sender: {type: String, required: true},
    sender_name: {type: String, required: true},
    sender_position: String,
    sender_avatar: {type: String, required: true},
    timestamp: {type: Number, unique: true, required: true},
    message: {type: String, required: true},
    date_created: {type: String, required: true},
    time_created: {type: String, required: true},
    ac_type: {type: String, required: true},
    beat: {type: String, required: true},
    tags: Array,
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