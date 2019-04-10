const users = require('./schemas/users');

function check(req, res){
    let v_id = req.params.v_id;
    let found = false;

    users.findOne({v_id: v_id}, (err, ret_u)=>{
        if(err){
            throw err;
        }
        else {
            if(ret_u != null){
                found = true;
            }
            res.send(found);
        }
    });
}

module.exports = check;