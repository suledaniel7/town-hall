const organisations = require('./schemas/organisations');

function settings(req, res, username){
    organisations.findOne({username: username}, (err, ret_o)=>{
        if(err){
            throw err;
        }
        else if(!ret_o){
            res.redirect('/');
        }
        else if(!req.organisation.user){
            res.redirect('/');
        }
        else if(username !== req.organisation.user.username){
            res.redirect('/');
        }
        else {
            let notif = '';
            if(req.notifications.notif){
                notif = req.notifications.notif;
                req.notifications.notif = null;
            }

            ret_o.notif = notif;
            res.render('o_settings', ret_o);
        }
    });
}

module.exports = settings;