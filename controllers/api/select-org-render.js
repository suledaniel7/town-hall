const organisations = require('../schemas/organisations');
const strip = require('./strip');

function renderOrgs(req, res){
    let username = req.journalist.user.username;
    
    organisations.find((err, orgs)=>{
        if(err){
            throw err;
        }
        else {
            let compObj = {
                username: username,
                organisations: strip([orgs], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0]
            }
            res.send(JSON.stringify({success: true, item: compObj}));
        }
    });
}

module.exports = renderOrgs;