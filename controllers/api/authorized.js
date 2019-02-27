const auths = require('../schemas/auths');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');

function authorized(req, res) {
    let ip = req.ip;
    ip = String(ip);
    let s_type = req.body.s_type;

    auths.findOne({ ip: ip }, (err, ret_a) => {
        if (err) {
            throw err;
        }
        else if (!ret_a) {
            res.send(JSON.stringify({ success: false }));
        }
        else if (ret_a.password_changed) {
            res.send(JSON.stringify({ success: false }));
        }
        else {
            let u_type = ret_a.u_type;
            let username = ret_a.username;

            if (u_type === s_type) {
                if (u_type == 'u') {
                    users.findOne({ username: username }, (err, ret_u) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_u) {
                            res.send(JSON.stringify({ success: false }));
                        }
                        else {
                            res.send(JSON.stringify({ success: true }));
                        }
                    });
                }
                else if (u_type == 'j') {
                    journalists.findOne({ username: username }, (err, ret_j) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_j) {
                            res.send(JSON.stringify({ success: false }));
                        }
                        else {
                            if (!ret_j.account.status) {
                                res.send(JSON.stringify({ success: false }));
                            }
                            else {
                                res.send(JSON.stringify({ success: true }));
                            }
                        }
                    });
                }
                else if (u_type == 'o') {
                    organisations.findOne({ username: username }, (err, ret_o) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_o) {
                            res.send(JSON.stringify({ success: false }));
                        }
                        else {
                            if (ret_o.pendingBeat) {
                                if (ret_o.pendingBeat.status) {
                                    res.send(JSON.stringify({ success: false }));
                                }
                                else {
                                    res.send(JSON.stringify({ success: true }));
                                }
                            }
                            else {
                                res.send(JSON.stringify({ success: true }));
                            }
                        }
                    });
                }
                else if (u_type == 'l') {
                    legislators.findOne({ code: username }, (err, ret_l) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_l) {
                            res.send(JSON.stringify({ success: false }));
                        }
                        else {
                            res.send(JSON.stringify({ success: true }));
                        }
                    });
                }
                else {
                    res.send({ success: false });
                }
            }
            else {
                res.send(JSON.stringify({ success: false }));
            }
        }
    });
}

module.exports = authorized;