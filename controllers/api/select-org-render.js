const organisations = require('../schemas/organisations');
const strip = require('./strip');

function renderOrgs(req, res) {
    if (!req.journalist.user) {
        res.send(JSON.stringify({ success: false, reason: "You must be signed in to access this function" }));
    }
    else {
        let username = req.journalist.user.username;
        organisations.find().sort({ name: 1 }).exec((err, orgs) => {
            if (err) {
                throw err;
            }
            else {
                let compObj = {
                    username: username,
                    organisations: strip([orgs], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0]
                }
                res.send(JSON.stringify({ success: true, item: compObj }));
            }
        });
    }
}

module.exports = renderOrgs;