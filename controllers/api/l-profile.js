const legis = require('../schemas/legislators');
const districts = require('../schemas/districts');
const messages = require('../schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');

function profileRender(req, res){
    let email = req.legislator.user.email;
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

                            messages.find({sender: code}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    let tmpMsgs = extractTags(ret_msgs, code);
                                    ret_l.messages = extractMentions(tmpMsgs);

                                    messages.find({beat: code}).sort({timestamp: -1}).exec((err, ret_d_msgs)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            let tmpDMsgs = extractTags(ret_d_msgs, code);
                                            ret_l.dist_posts = extractMentions(tmpDMsgs);

                                            //mentions
                                            let full_name = ret_l.type_exp + ret_l.full_name;
                                            full_name = RegExp(full_name);
                                            messages.find({message: full_name}).sort({timestamp: -1}).exec((err, ret_ms)=>{
                                                if(err){
                                                    throw err;
                                                }
                                                else {
                                                    let tmpMMsgs = extractTags(ret_ms, code);
                                                    ret_l.mentions = extractMentions(tmpMMsgs);

                                                    res.send(JSON.stringify({success: true, item: ret_l}));
                                                }
                                            });
                                        }
                                    });
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