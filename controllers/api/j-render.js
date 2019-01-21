const journalists = require('../schemas/journalists');
const messages = require('../schemas/messages');
// const extractTags = require('./extractTags');
// const extractMentions = require('./extractMentions');

function renderJ(req, res, username, user, c_username){
    let item = {};
    journalists.findOne({username: username}, (err, ret_j)=>{
        if(err){
            throw err;
        }
        else if(!ret_j){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));//should lead to error page stating that the journo wasn't found
        }
        else {
            //journo exists. render after parsing user info
            if(user){
                item.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if(source == ret_j.username){
                        flag = true;
                    }
                });
                if(user.dislikes.indexOf(ret_j.username) != -1){
                    flag = false;
                }
                item.following = flag;
            }
            //if journo hasn't selected a beat or an org
            if(!ret_j.account.status){
                item.canFollow = false;
            }
            ret_j.password = null;
            ret_j.likes = null;
            ret_j.dislikes = null;
            ret_j.followers = null;
            ret_j.rejected = null;

            messages.find({sender: username}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                if(err){
                    throw err;
                }
                else {
                    // let tmpMsgs = extractTags(ret_msgs, null);
                    // item.messages = extractMentions(tmpMsgs);
                    item.messages = ret_msgs;
                    item.user = ret_j;
                    item.username = c_username;
                    res.send(JSON.stringify({success: true, ac_type: 'j', item: item}));
                }
            });
        }
    });
}

module.exports = renderJ;