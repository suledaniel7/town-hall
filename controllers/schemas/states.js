const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({
    name: {type: String, required: true},
    f_name: {type: String, required: true},//for searching, obviously
    sen_dists: Array,
    rep_dists: Array,
    state_code: {type: String, unique: true, required: true}
});

const states = mongoose.model('states', stateSchema);
module.exports = states;