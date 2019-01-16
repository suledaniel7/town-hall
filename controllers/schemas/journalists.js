const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const journo = new Schema({
    username: {type: String, required: true, unique: true},//default is lc
    email: {type: String, required: true, unique: true},
    f_name: {type: String, required: true},
    lc_f_name: {type: String, required: true},
    l_name: {type: String, required: true},
    lc_l_name: {type: String, required: true},
    full_name: {type: String, required: true},
    password: {type: String, required: true},
    account: {type: Object, required: true},
    avatar: {type: String, required: true},
    orientation: {type: Boolean, required: true},
    verified: {type: Boolean, required: true},
    followersNo: { type: Number, required: true },
    messages_no: {type: Number, default: 0},
    rejected: {type: Object, required: true},
    description: {type: String, required: true},
    bio: {type: String, default: ''},
    ac_type: {type: String, default: 'j'},
    organisation: String,
    orgName: String,
    beat: String,
    beatName: String,
    beatDets: Object,
    sources: Array,
    likes: Array,
    dislikes: Array,
    followers: Array
});

const journalist = mongoose.model('journalists', journo);

module.exports = journalist;