const generals = require('../schemas/general');

function check(req, res){
    let email = req.params.email.toLowerCase();
    let found = false;

    generals.findOne({email: email}, (err, ret_user)=>{
        if(err){
            throw err;
        }
        else {
            if(ret_user != null){
                found = true;
            }
            res.send(JSON.stringify({found: found}));
        }
    });
}

module.exports = check;