const legislators = require('./schemas/legislators');
const districts = require('./schemas/districts');
const messages = require('./schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
const findUser = require('./findUser');

function renderProfile(req, res, code, user){
    legislators.findOne({code: code}, (err, ret_l)=>{
        if(err){
            throw err;
        }
        else if(!ret_l){
            res.redirect('/');//explain what happened
        }
        else {
            if(user){
                ret_l.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if(source == ret_l.code){
                        flag = true;
                    }
                });
                if(user.districts.indexOf(code) != -1){
                    flag = true;
                }
                ret_l.following = flag;
            }
            ret_l.likes = null;
            ret_l.dislikes = null;
            ret_l.password = null;
            
            districts.findOne({code: code}, (err, ret_d)=>{
                if(err){
                    throw err;
                }
                else if (!ret_d){
                    console.log("Significant error. Cannot find district for legislator bearing code:", code);
                    res.redirect('/');
                }
                else {
                    ret_l.const_num = ret_d.const_num;

                    messages.find({sender: code}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                        if(err){
                            throw err;
                        }
                        else {
                            let tmpMsgs = extractTags(ret_msgs, null);
                            ret_l.messages = extractMentions(tmpMsgs);
                            
                            retrieveReporting(code, ret_l);
                            async function retrieveReporting(code, legis){
                                let ret_user = await findUser(req);
                                if(!ret_user){
                                    res.redirect('/');
                                }
                                else {
                                    let username = ret_user.username;
                                    if(!username){
                                        username = ret_user.code;
                                    }

                                    messages.find({$or:[{beats: code}, {mentions: code}]}).sort({timestamp: -1}).exec((err, ret_b_msgs)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            let tmpBMsgs = extractTags(ret_b_msgs, username);
                                            let b_msgs = extractMentions(tmpBMsgs, null);

                                            legis.b_msgs = b_msgs;

                                            res.render('l-render', legis);
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }
    });
}

module.exports = renderProfile;