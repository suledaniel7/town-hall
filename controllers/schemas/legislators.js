const mongoose = require('mongoose');
const Schema = mongoose.Schema;//create absolutely different schemas for 'tweets' for everyone. Three different schemas for the three account classes

const legislatorSchema = new Schema({
    lc_name: {type: String, required: true},//lowercase, for searching
    password: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    f_name: {type: String, required: true},
    l_name: {type: String, required: true},
    full_name: {type: String, required: true},
    district: {type: String, required: true},
    district_code: {type: String, required: true},
    type: {type: String, required: true},
    type_exp: {type: String, required: true},//Type expatiated: Sen. or Rep.
    state: {type: String, required: true},
    state_code: {type: String, required: true},
    messages_no: Number,
    bio: String,
    gender: {type: String, required: true},
    code: {type: String, unique: true, required: true},
    avatar: {type: String, required: true},
    likes: Array,
    dislikes: Array
});

const leg = mongoose.model('legislators', legislatorSchema);

module.exports = leg;