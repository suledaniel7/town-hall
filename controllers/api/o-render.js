const organisations = require('../schemas/organisations');
const messages = require('../schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');

function renderProfile(req, res, username, user, c_username){
    let item = {};
    organisations.findOne({username: username}, (err, ret_o)=>{
        if(err){
            throw err;
        }
        else if(!ret_o){
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));//redirect to error page explaining what happened
        }
        else {
            if(user){
                item.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if(source == ret_o.username){
                        flag = true;
                    }
                });
                item.following = flag;
            }
            ret_o.journalists = null;
            ret_o.districts = null;
            ret_o.pending_reqs = null;
            ret_o.followers = null;
            ret_o.likes = null;
            ret_o.dislikes = null;
            ret_o.email = null;
            ret_o.verification.id = null;
            ret_o.password = null;
            ret_o.pendingBeat = null;

            messages.find({sender: username}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                if(err){
                    throw err;
                }
                else {
                    let tmpMsgs = extractTags(ret_msgs, null);
                    item.messages = extractMentions(tmpMsgs);
                    item.user = ret_o;
                    item.username = c_username;
                    res.send(JSON.stringify({success: true, item: item}));
                }
            });
        }
    });
}

module.exports = renderProfile;