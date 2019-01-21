const hash = require('password-hash');

const generals = require('../schemas/general');
const organisations = require('../schemas/organisations');
const ripple = require('../ripple');

function update(req, res) {
    let item = {};
    let sect = req.params.upd_type;

    if (sect == 'bio') {
        let bio = req.body.bio;

        let wsp = /^\s*$/g;
        bio.replace(wsp, '');
        if (req.organisation.user) {
            let username = req.organisation.user.username;
            organisations.findOne({ username: username }, (err, ret_o) => {
                let ret_o_p = JSON.parse(JSON.stringify(ret_o));
                if (err) {
                    throw err;
                }
                else {
                    if (ret_o.bio !== bio) {
                        ret_o.bio = bio;

                        organisations.findOneAndUpdate({ username: username }, ret_o, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                item.notif = "Successful!";
                                req.organisation.user = ret_o;
                                res.send(JSON.stringify({ success: true, item: item }));
                                ripple('o', ret_o_p, ret_o);
                            }
                        });
                    }
                    else {
                        res.send(JSON.stringify({ success: true }));
                    }
                }
            });
        }
    }
    else if (sect == 'dets') {
        let { name, username, email, pub_email, password, n_pass } = req.body;
        let wsp = /^\s*$/;

        let test = (text) => {
            return wsp.test(text);
        }
        if (test(name) || test(username) || test(email) || test(pub_email)) {
            res.send(JSON.stringify({success: false, reason: "Mandatory fields not filled out"}))
        }
        else if (req.organisation.user) {
            let curr_username = req.organisation.user.username;
            organisations.findOne({ username: curr_username }, (err, ret_o) => {
                let ret_o_p = JSON.parse(JSON.stringify(ret_o));
                if (err) {
                    throw err;
                }
                else {
                    let changed = false;
                    let valid = true;
                    async function checks() {
                        if (username !== curr_username) {
                            changed = true;
                            let found = await check_username(username);
                            if (found) {
                                valid = false;
                                res.send(JSON.stringify({ success: false, reason: "A user exists with that username" }));
                            }
                            else {
                                ret_o.username = username;
                            }
                        }
                        if (email !== ret_o.email) {
                            changed = true;
                            let found = await check_email(email);
                            if (found) {
                                valid = false;
                                res.send(JSON.stringify({ success: false, reason: "A user exists with that email address" }));
                            }
                            else {
                                ret_o.email = email;
                            }
                        }
                        if (pub_email !== ret_o.pub_email) {
                            changed = true;
                            let found = await check_email(pub_email);
                            if (found) {
                                valid = false;
                                res.send(JSON.stringify({ success: false, reason: "A user exists with that Correspondence email address" }));
                            }
                            else {
                                ret_o.pub_email = pub_email;
                            }
                        }
                        if (name !== ret_o.name) {
                            changed = true;
                            if (wsp.test(name)) {
                                valid = false;
                                res.send(JSON.stringify({ success: false, reason: "'Name' field must be filled out" }));
                            }
                            else {
                                ret_o.name = name;
                                ret_o.lc_name = name.toLowerCase();
                            }
                        }
                        if (!wsp.test(password)) {
                            if (hash.verify(password, ret_o.password)) {
                                //valid. Can change if wants to
                                if (!wsp.test(n_pass)) {
                                    changed = true;
                                    ret_o.password = hash.generate(n_pass);
                                }
                            }
                            else {
                                valid = false;
                                res.send(JSON.stringify({ success: false, reason: "Incorrect Password" }));
                            }
                        }

                        if (valid && changed) {
                            update(ret_o);
                        }
                        else if (valid && !changed) {
                            res.send(JSON.stringify({ success: false, reason: "No changes made" }));
                        }
                    }

                    checks();

                    function check_username(username) {
                        return new Promise((resolve, reject) => {
                            generals.findOne({ username: username }, (err, ret_g) => {
                                if (err) {
                                    reject(err);
                                }
                                else if (!ret_g) {
                                    resolve(null);
                                }
                                else {
                                    resolve(true);
                                }
                            });
                        });
                    }

                    function check_email(email) {
                        return new Promise((resolve, reject) => {
                            generals.findOne({ email: email }, (err, ret_g) => {
                                if (err) {
                                    reject(err);
                                }
                                else if (!ret_g) {
                                    resolve(null);
                                }
                                else {
                                    resolve(true);
                                }
                            });
                        });
                    }

                    function update(org) {
                        organisations.findOneAndUpdate({ username: curr_username }, org, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                generals.findOne({ username: curr_username }, (err, ret_g) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else if (!ret_g) {
                                        console.log(`Error occured finding the general for user who changed username from ${curr_username} to ${username}`);
                                    }
                                    else {
                                        ret_g.username = username;
                                        ret_g.email = email;

                                        generals.findOneAndUpdate({ username: curr_username }, ret_g, (err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            else {
                                                item.notif = "Successful!";
                                                req.organisation.user = org;
                                                res.send(JSON.stringify({ success: true, item: item }));
                                                ripple('o', ret_o_p, ret_o);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
        else {
            res.send(JSON.stringify({success: false, reason: "Invalid Parameters"}));
        }
    }
}

module.exports = update;