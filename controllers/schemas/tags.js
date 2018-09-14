const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let tagSchema = new Schema({
    tag: {type: String, required: true},
    mentions: Number,
    related: Array
});

let tags = mongoose.model('tags', tagSchema);
module.exports = tags;