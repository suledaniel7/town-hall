const findActive = require('./findActive');
const u_s = require('./u_settings');
const j_s = require('./j_settings');
const o_s = require('./o_settings');
const l_s = require('./l_settings');

async function settings(req, res) {

    let u_type = await findActive(req, res);
    if (u_type == 'user') {
        let username = req.user.user.username;
        if (username) {
            u_s(req, res, username);
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "Invalid User Account" }));
        }
    }
    else if (u_type == 'legislator') {
        let username = req.legislator.user.code;
        if (username) {
            l_s(req, res, username);
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "Invalid User Account" }));
        }
    }
    else if (u_type == 'organisation') {
        let username = req.organisation.user.username;
        if (username) {
            o_s(req, res, username);
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "Invalid User Account" }));
        }
    }
    else if (u_type == 'journalist') {
        let username = req.journalist.user.username;
        if (username) {
            j_s(req, res, username);
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "Invalid User Account" }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
    }
}

module.exports = settings;