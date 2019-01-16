const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    username: { type: String, unique: true, required: true },
    f_name: { type: String, required: true },
    lc_f_name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    state: { type: String, required: true },
    state_code: { type: String, required: true },
    fed_const: { type: String, required: true },
    sen_dist: { type: String, required: true },
    sources: { type: Array, required: true },
    ac_type: { type: String, default: 'u' },
    gender: {type: String, required: true},
    avatar: { type: String, required: true },
    sourceSel: Boolean,
    bio: { type: String, default: '' },
    date_joined: { type: String, required: true },
    description: { type: String, required: true },
    preferences: Object,
    likes: Array,
    dislikes: Array,
    date_created: Date
    // Preferences contains the key codes to districts the user is interested in
    // Also, it prioritizes the news organisations he'd read
    // Two properties: districts, w/unique codes et orgs
    // SourceSel informs on whether the user is subscribed to any news orgs
});

userSchema.pre('save', (next) => {
    userSchema.date_created = new Date();
    next();
});

const users = mongoose.model('users', userSchema);
module.exports = users;