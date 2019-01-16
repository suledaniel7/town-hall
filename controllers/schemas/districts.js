const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const districtSchema = new Schema({
    name: { type: String, required: true },
    f_name: { type: String, required: true },//for searching, yup
    type: { type: String, required: true },
    type_name: { type: String, required: true },
    state_code: { type: String, required: true },
    state: { type: String, required: true },
    const_num: Number,
    rep: { type: String, required: true },//uses the full_name property
    dist_code: { type: String, required: true },
    code: { type: String, unique: true, required: true }
});

const district = mongoose.model('districts', districtSchema);

module.exports = district;