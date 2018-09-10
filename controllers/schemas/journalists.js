const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const journo = new Schema({
    username: {type: String, required: true, unique: true},//default is lc
    email: {type: String, required: true, unique: true},
    f_name: {type: String, required: true},
    lc_f_name: {type: String, required: true},
    l_name: {type: String, required: true},
    lc_l_name: {type: String, required: true},
    password: {type: String, required: true},
    account: {type: Object, required: true},
    avatar: {type: String, required: true},
    orientation: {type: Boolean, required: true},
    verified: {type: Boolean, required: true},
    followersNo: { type: Number, required: true },
    messagesNo: Number,
    rejected: {type: Object, required: true},
    organisation: String,
    orgName: String,
    beat: String,
    beatDets: Object,
    likes: Array,
    dislikes: Array,
    followers: Array//nah
});

const journalist = mongoose.model('journalists', journo);

module.exports = journalist;