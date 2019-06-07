const conversations = require('../schemas/conversation');
const findUser = require('./findUser');

function serve(req, res){
    let code = req.params.code;
    findUser(req).then((user)=>{
        if(code){
            conversations.find({l_code: code}, (err, ret_cs)=>{
                if(err){
                    res.send(JSON.stringify({success: false, reason: "An error occured on our end. Please try again later"}));
                }
                else {
                    res.send(JSON.stringify({success: true, conversations: ret_cs, avatar: user.avatar}));
                }
            });
        }
        else {
            res.send(JSON.stringify({success: false, reason: "Invalid request"}));
        }
    }).catch(e => {
        res.send(JSON.stringify({success: false, reason: "You must be logged in to access this feature"}));
    });
}

module.exports = serve;