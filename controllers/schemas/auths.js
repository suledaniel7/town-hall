const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let authSchema = new Schema({
    username: {type: String, required: true},
    ip: {type: String, required: true, unique: true},
    u_type: {type: String, required: true},
    password_changed: {type: Boolean, default: false}
});

const auth = mongoose.model('auth', authSchema);

module.exports = auth;