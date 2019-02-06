const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gen = new Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    identifier: {type: String, required: true},
    online: {type: Boolean, default: false},
    socket_id: {type: String, unique: true, default: ''},
});

const general = mongoose.model('general', gen);

module.exports = general;