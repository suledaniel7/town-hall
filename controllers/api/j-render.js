const journalists = require('../schemas/journalists');
const messages = require('../schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');

function renderJ(req, res, username, user){
    journalists.findOne({username: username}, (err, ret_j)=>{
        if(err){
            throw err;
        }
        else if(!ret_j){
            res.send({success: false, reason: "Invalid Account"});//should lead to error page stating that the journo wasn't found
        }
        else {
            //journo exists. render after parsing user info
            if(user){
                ret_j.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if(source == ret_j.username || source == ret_j.organisation){
                        flag = true;
                    }
                });
                if(user.dislikes.indexOf(ret_j.username) != -1){
                    flag = false;
                }
                ret_j.following = flag;
            }
            //if journo hasn't selected a beat or an org
            if(!ret_j.account.status){
                ret_j.canFollow = false;
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
                    let tmpMsgs = extractTags(ret_msgs, null);
                    ret_j.messages = extractMentions(tmpMsgs);
                    res.send({success: true, item: ret_j});
                }
            });
        }
    });
}

module.exports = renderJ;