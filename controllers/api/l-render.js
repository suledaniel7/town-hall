const legislators = require('../schemas/legislators');
const districts = require('../schemas/districts');
const messages = require('../schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');

function renderProfile(req, res, code, user, c_username){
    let item = {};
    legislators.findOne({code: code}, (err, ret_l)=>{
        if(err){
            throw err;
        }
        else if(!ret_l){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));//explain what happened
        }
        else {
            if(user){
                item.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if(source == ret_l.code){
                        flag = true;
                    }
                });
                if(user.districts.indexOf(code) != -1){
                    flag = true;
                }
                item.following = flag;
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
                    res.send(JSON.stringify({success: false, reason: "Invalid Account District"}));
                }
                else {
                    item.const_num = ret_d.const_num;

                    messages.find({sender: code}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                        if(err){
                            throw err;
                        }
                        else {
                            let tmpMsgs = extractTags(ret_msgs, null);
                            item.messages = extractMentions(tmpMsgs);
                            item.user = ret_l;
                            item.username = c_username;
                            res.send(JSON.stringify({success: true, item: item}));
                        }
                    });
                }
            });
        }
    });
}

module.exports = renderProfile;