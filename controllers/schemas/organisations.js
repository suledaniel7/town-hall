const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orgSchema = new Schema({
    name: {type: String, required: true},
    lc_name: {type: String, required: true},
    username: {type: String, required: true, unique: true},//default is lc
    email: {type: String, required: true, unique: true},
    pub_email: {type: String, required: true, unique: true},
    verification: {type: Object, required: true},
    password: {type: String, required: true},
    messages_no: {type: Number, default: 0},
    followersNo: { type: Number, required: true },
    pendingBeat: { type: Object, required: true },
    journo_num: {type: Number, default: 0},
    bio: {type: String, default: ''},
    districts: Array,
    journalists: Array,
    pending_reqs: Array,
    followers: Array,//of objects w/ three props: no of followers, and unique attr of beat, and name/type of beat
    logo: String,
    likes: Array,
    dislikes: Array
});

const orgs = mongoose.model('organisations', orgSchema);

module.exports = orgs;