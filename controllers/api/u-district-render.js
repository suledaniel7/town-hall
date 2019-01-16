const districts = require('../schemas/districts');

function render_dists(req, res){
    let state_code = req.params.key;
    districts.find({state_code: state_code}).sort({name: 1}).exec((err, ret_dists)=>{
        if(err){
            throw err;
        }
        else {
            let sen_dists = [];
            let fed_consts = [];
            
            ret_dists.forEach(dist => {
                if(dist.type == 'sen'){
                    sen_dists.push(dist);
                }
                else {
                    fed_consts.push(dist);
                }
            })
            let item = {
                fed_consts: fed_consts,
                sen_dists: sen_dists
            }
            res.send(JSON.stringify({success: true, item: item}));
        }
    });
}

module.exports = render_dists;