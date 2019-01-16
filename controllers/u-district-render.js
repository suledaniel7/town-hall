const districts = require('./schemas/districts');

function render_dists(req, res){
    let state_code = req.params.key;
    districts.find({state_code: state_code}).sort({name: 1}).exec((err, ret_dists)=>{
        if(err){
            throw err;
        }
        else {
            res.send({districts: ret_dists});
        }
    });
}

module.exports = render_dists;