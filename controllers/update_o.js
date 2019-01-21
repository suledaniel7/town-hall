const hash = require('password-hash');

const generals = require('./schemas/general');
const organisations = require('./schemas/organisations');
const convertPath = require('./uploadFilePathConversion');
const ripple = require('./ripple');

function update(req, res) {
    let sect = req.params.upd_type;

    if (sect == 'bio') {
        let bio = req.body.bio;
        let img = req.file;
        let fPath = null;
        if (img) {
            fPath = convertPath(img);
        }

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
                    if (ret_o.bio !== bio || fPath) {
                        ret_o.bio = bio;
                        if (fPath) {
                            ret_o.logo = fPath;
                        }

                        organisations.findOneAndUpdate({ username: username }, ret_o, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                req.notifications.notif = "Successful!";
                                req.organisation.user = ret_o;
                                res.redirect('/settings/' + username);
                                ripple('o', ret_o_p, ret_o);
                            }
                        });
                    }
                    else {
                        res.redirect('/settings/' + username);
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
            req.notifications.notif = "Mandatory fields not filled out";
            res.redirect(req.referer);
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
                                req.notifications.notif = "A user exists with that username";
                                res.redirect('/settings/' + curr_username);
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
                                req.notifications.notif = "A user exists with that email address";
                                res.redirect('/settings/' + curr_username);
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
                                req.notifications.notif = "A user exists with your Correspondence email address";
                                res.redirect('/settings/' + curr_username);
                            }
                            else {
                                ret_o.pub_email = pub_email;
                            }
                        }
                        if (name !== ret_o.name) {
                            changed = true;
                            if (wsp.test(name)) {
                                valid = false;
                                req.notifications.notif = "'Name' field must be filled out";
                                res.redirect('/settings/' + curr_username);
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
                                req.notifications.notif = "Incorrect Password";
                                res.redirect('/settings/' + curr_username);
                            }
                        }

                        if (valid && changed) {
                            update(ret_o);
                        }
                        else if (valid && !changed) {
                            req.notifications.notif = "No changes made";
                            res.redirect('/settings/' + curr_username);
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
                                                req.notifications.notif = "Successful!";
                                                req.organisation.user = org;
                                                res.redirect('/settings/' + org.username);
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
            res.redirect('/');
        }
    }
}

module.exports = update;