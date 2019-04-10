const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const legislationSchema = new Schema({
    sponsors: {type: Array, required: true},
    sponsor_details: {type: Array, required: true},
    title: {type: String, required: true},
    official_title: {type: String, required: true},
    code: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    text_link: {type: String, required: true},
    status: {type: Object, required: true},
    date_created: {type: String, required: true},
    time_created: {type: String, required: true},
    timestamp: {type: Number, required: true},
    timeline: {type: Array, required: true}
});

let legislation = mongoose.model('legislation', legislationSchema);

module.exports = legislation;