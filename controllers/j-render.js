const journalists = require('./schemas/journalists');
const messages = require('./schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');

function renderJ(req, res, username){
    journalists.findOne({username: username}, (err, ret_j)=>{
        if(err){
            throw err;
        }
        else if(!ret_j){
            res.redirect('/');//should lead to error page stating that the journo wasn't found
        }
        else {
            //journo exists. render
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
                    res.render('j-render', ret_j);
                }
            });
        }
    });
}

module.exports = renderJ;