const journalists = require('../schemas/journalists');

function rejection(req, res) {
    if (req.journalist.user) {
        if (req.journalist.user.username) {
            let username = req.journalist.user.username;
            journalists.findOne({username: username}, (err, ret_j)=>{
                let item = {};
                if(err){
                    throw err;
                }
                else if(!ret_j){
                    res.send(JSON.stringify({ success: false, reason: "Invalid Journalist Account" }));
                }
                else {
                    if(ret_j.rejected.status){
                        item.rejection = true;
                        if(ret_j.rejected.removed){
                            item.removed = true;
                        }
                        else {
                            item.removed = false;
                        }

                        if(ret_j.rejected.organisation){
                            item.organisation = ret_j.rejected.organisation;
                        }
                    }
                    else {
                        item.rejection = false;
                    }
                    res.send(JSON.stringify({success: true, item: item}));
                }
            });
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "You must be logged in to perform this function" }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, reason: "You must be logged in to perform this function" }));
    }
}

module.exports = rejection;