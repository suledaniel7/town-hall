const organisations = require('./schemas/organisations');
const messages = require('./schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');

function renderProfile(req, res, username, user){
    organisations.findOne({username: username}, (err, ret_o)=>{
        if(err){
            throw err;
        }
        else if(!ret_o){
            res.redirect('/');//redirect to error page explaining what happened
        }
        else {
            if(user){
                ret_o.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if(source == ret_o.username){
                        flag = true;
                    }
                });
                ret_o.following = flag;
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
                    ret_o.messages = extractMentions(tmpMsgs);
                    res.render('o-render', ret_o);
                }
            });
        }
    });
}

module.exports = renderProfile;