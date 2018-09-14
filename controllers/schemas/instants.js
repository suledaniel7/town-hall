const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let instantSchema = new Schema({
    name: {required: true, type: String},
    href: {required: true, type: String},
    type: {required: true, type: String},
    mentions: {required: true, type: Number}
});

let instant = mongoose.model('instant', instantSchema);

module.exports = instant;