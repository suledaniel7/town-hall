const organisations = require('../schemas/organisations');

function settings(req, res, username){
    let item = {};
    organisations.findOne({username: username}, (err, ret_o)=>{
        if(err){
            throw err;
        }
        else if(!ret_o){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
        }
        else if(!req.organisation.user){
            res.send(JSON.stringify({success: false, reason: "You must be signed in to access this function"}));
        }
        else if(username !== req.organisation.user.username){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
        }
        else {
            let notif = '';
            if(req.notifications.notif){
                notif = req.notifications.notif;
                req.notifications.notif = null;
            }

            item.user = ret_o;
            item.notif = notif;
            res.send(JSON.stringify({success: true, item: item}));
        }
    });
}

module.exports = settings;