const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let reportSchema = new Schema({
    r_type: {type: String, required: true},
    reported_by: {type: Array, required: true},
    m_timestamp: {type: String, unique: true, required: true},
    message_sender: {type: String, required: true},
    timestamp: {type: Number, required: true},
    report_count: {type: Number, required: true},
    resolved: {type: Boolean, default: false}
});

const reports = mongoose.model('reports', reportSchema);

module.exports = reports;