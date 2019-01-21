const legislators = require('./schemas/legislators');

function settings(req, res, code){
    legislators.findOne({code: code}, (err, ret_l)=>{
        if(err){
            throw err;
        }
        else if(!ret_l){
            res.redirect('/');
        }
        else if(!req.legislator.user){
            res.redirect('/');
        }
        else if(code !== req.legislator.user.code){
            res.redirect('/');
        }
        else {
            let notif = '';
            if(req.notifications.notif){
                notif = req.notifications.notif;
                req.notifications.notif = null;
            }

            ret_l.notif = notif;
            res.render('l_settings', ret_l);
        }
    });
}

module.exports = settings;