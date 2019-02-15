const journalists = require('../schemas/journalists');

function status(req, res){
    let username = req.journalist.user.username;

    journalists.findOne({username: username}, (err, ret_j)=>{
        if(err){
            throw err;
        }
        else if(!ret_j){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
        }
        else {
            let ac_type = ret_j.account.type;
            if(ac_type === 'formal'){
                //is j org-anised
                let orged = false;
                if(ret_j.organisation.length > 0){
                    orged = true;
                }
                res.send(JSON.stringify({success: true, ac_type: 'm', status: orged}))
            }
            else {
                //is j beat-ed
                let beated = false;
                if(ret_j.beat.length > 0){
                    beated = true;
                }
                res.send(JSON.stringify({success: true, ac_type: 'f', status: beated}));
            }
        }
    });
}

module.exports = status;