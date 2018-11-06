const generals = require('../schemas/general');

function check(req, res){
    let username = req.params.username.toLowerCase();
    let found = false;

    generals.findOne({username: username}, (err, ret_user)=>{
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