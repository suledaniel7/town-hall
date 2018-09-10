const legis = require('./schemas/legislators');
const districts = require('./schemas/districts');
const messages = require('./schemas/messages');
const extractTags = require('./extractTags');

function profileRender(req, res){
    let email = req.legislator.user.email;
    if(!email){
        req.legislator.user = null;
        res.redirect('/');
    }
    else {
        legis.findOne({email: email}, (err, ret_l)=>{
            if(err){
                req.legislator.user = null;
                res.redirect('/');
                throw err;
            }
            else {
                if(!ret_l){
                    req.legislator.user = null;
                    res.redirect('/');
                }
                else if(ret_l.password !== req.legislator.user.password){
                    req.legislator.user = null;
                    res.redirect('/');
                }
                else {
                    let code = ret_l.code;
                    districts.findOne({code: code}, (err, ret_dist)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_dist){
                            req.legislator.user = null;
                            res.redirect('/');
                        }
                        else {
                            let const_num = ret_dist.const_num;
                            ret_l.const_num = const_num;
                            ret_l.password = null;

                            messages.find({sender: code}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    ret_l.messages = extractTags(ret_msgs, email);
                                    res.render('l-profile', ret_l);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}

module.exports = profileRender;