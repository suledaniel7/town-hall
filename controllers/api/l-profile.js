const legis = require('../schemas/legislators');
const districts = require('../schemas/districts');
const messages = require('../schemas/messages');
// const extractTags = require('./extractTags');
// const extractMentions = require('./extractMentions');

function profileRender(req, res){
    let email = req.legislator.user.email;
    let item = {};
    item.u_type = 'l';
    let page = req.query.pg;

    if(!email){
        req.legislator.user = null;
        res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
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
                    res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                }
                else if(ret_l.password !== req.legislator.user.password){
                    req.legislator.user = null;
                    res.send(JSON.stringify({success: false, reason: "Invalid Credentials"}));
                }
                else {
                    let code = ret_l.code;
                    districts.findOne({code: code}, (err, ret_dist)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_dist){
                            req.legislator.user = null;
                            res.send(JSON.stringify({success: false, reason: "Invalid District"}));
                        }
                        else {
                            ret_l.password = null;
                            item.user = ret_l;
                            if (page == 'home'){
                                messages.find({beats: code}).sort({timestamp: -1}).exec((err, ret_d_msgs)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        // let tmpDMsgs = extractTags(ret_d_msgs, code);
                                        // item.dist_posts = extractMentions(tmpDMsgs);
                                        item.dist_posts = ret_d_msgs;

                                        res.send(JSON.stringify({success: true, item: item}));
                                    }
                                });
                            }
                            else if(page == 'profile'){
                                messages.find({sender: code}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        // let tmpMsgs = extractTags(ret_msgs, code);
                                        // item.messages = extractMentions(tmpMsgs);
                                        item.messages = ret_msgs;
                                        item.user = ret_l;
                                        item.district = ret_dist;

                                        res.send(JSON.stringify({success: true, item: item}));
                                    }
                                });
                            }
                            else {
                                res.send(JSON.stringify({success: false, reason: "Invalid Page Request"}));
                            }
                        }
                    });
                }
            }
        });
    }
}

module.exports = profileRender;