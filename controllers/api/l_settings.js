const legislators = require('../schemas/legislators');

function settings(req, res, code){
    let item = {};
    legislators.findOne({code: code}, (err, ret_l)=>{
        if(err){
            throw err;
        }
        else if(!ret_l){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
        }
        else if(!req.legislator.user){
            res.send(JSON.stringify({success: false, reason: "You must be signed in to access this function"}));
        }
        else if(code !== req.legislator.user.code){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
        }
        else {
            let notif = '';
            if(req.notifications.notif){
                notif = req.notifications.notif;
                req.notifications.notif = null;
            }

            item.notif = notif;
            item.user = ret_l;
            res.send(JSON.stringify({success: true, item: item}));
        }
    });
}

module.exports = settings;