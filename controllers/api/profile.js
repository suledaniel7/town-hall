const general = require('../schemas/general');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const findActive = require('./findActive');
const l_render = require('./l-render');
const j_render = require('./j-render');
const o_render = require('./o-render');
const u_render = require('./u-render');

function profile(req, res) {
    let username = req.params.username;
    let referee = req.headers.referer;

    let u_type = findActive(req, res);
    let curr_username = '';
    let user = null;
    if (u_type == 'user') {
        let username = req.user.user.username;
        curr_username = username;
        users.findOne({ username: username }, (err, ret_u) => {
            if (err) {
                req.user.user = null;
                throw err;
            }
            else if (!ret_u) {
                req.user.user = null;
            }
            else {
                user = {
                    username: ret_u.username,
                    sources: ret_u.sources,
                    districts: [ret_u.fed_const, ret_u.sen_dist],
                    likes: ret_u.likes,
                    dislikes: ret_u.dislikes
                }
                findGen(user);
            }
        });
    }
    else if (u_type == 'organisation') {
        curr_username = req.organisation.user.username;
        findGen(null);
    }
    else if (u_type == 'journalist') {
        let username = req.journalist.user.username;
        curr_username = username;
        journalists.findOne({ username: username }, (err, ret_j) => {
            if (err) {
                req.journalist.user = null;
                throw err;
            }
            else if (!ret_j) {
                req.journalist.user = null;
            }
            else {
                user = {
                    username: ret_j.username,
                    sources: ret_j.sources,
                    districts: [ret_j.beat],
                    likes: ret_j.likes,
                    dislikes: ret_j.dislikes
                }
                findGen(user);
            }
        });
    }
    else if (u_type == 'legislator') {
        curr_username = req.legislator.user.code;
        findGen(null);
    }
    else {
        findGen(null);
    }

    function findGen(user) {
        general.findOne({ username: username }, (err, ret_g) => {
            if (err) {
                throw err;
            }
            else if (!ret_g) {
                res.send(JSON.stringify({ success: false, isUser: true, reason: "Invalid Account" }));
            }
            else {
                let user_type = ret_g.identifier;
                if (user_type == 'j') {
                    j_render(req, res, username, user, curr_username);
                }
                else if (user_type == 'o') {
                    o_render(req, res, username, user, curr_username);
                }
                else if (user_type == 'l') {
                    l_render(req, res, username, user, curr_username);
                }
                else if (user_type == 'u') {
                    u_render(req, res, username, curr_username);
                }
                else {
                    res.send(JSON.stringify({ success: false, isUser: true, reason: "Invalid Account" }));
                }
            }
        });
    }
}

module.exports = profile;