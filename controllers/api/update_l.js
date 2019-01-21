const hash = require('password-hash');

const generals = require('../schemas/general');
const legislators = require('../schemas/legislators');
const ripple = require('../ripple');

function update(req, res) {
    let item = {};
    let sect = req.params.upd_type;

    if (sect == 'bio') {
        let bio = req.body.bio;

        let wsp = /^\s*$/g;
        bio.replace(wsp, '');
        if (req.legislator.user) {
            let code = req.legislator.user.code;
            legislators.findOne({ code: code }, (err, ret_l) => {
                let ret_l_p = JSON.parse(JSON.stringify(ret_l));
                if (err) {
                    throw err;
                }
                else {
                    if (ret_l.bio !== bio) {
                        ret_l.bio = bio;

                        legislators.findOneAndUpdate({ code: code }, ret_l, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                item.notif = "Successful!";
                                req.legislator.user = ret_l;
                                res.send(JSON.stringify({success: true, item: item}));
                                ripple('l', ret_l_p, ret_l);
                            }
                        });
                    }
                    else {
                        res.send(JSON.stringify({success: true}));
                    }
                }
            });
        }
    }
    else if (sect == 'dets') {
        let { f_name, l_name, email, password, n_pass, gender } = req.body;
        let wsp = /^\s*$/;
        let test = (text) => {
            return wsp.test(text);
        }
        if (test(f_name) || test(l_name) || test(email) || test(gender)) {
            item.notif = "Mandatory fields not filled out";
            res.send(JSON.stringify({success: false, reason: item.notif}));
        }
        else if (req.legislator.user) {
            let code = req.legislator.user.code;
            legislators.findOne({ code: code }, (err, ret_l) => {
                let ret_l_p = JSON.parse(JSON.stringify(ret_l));
                if (err) {
                    throw err;
                }
                else {
                    let changed = false;
                    let valid = true;
                    async function checks() {
                        if (email !== ret_l.email) {
                            changed = true;
                            let found = await check_email(email);
                            if (found) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: "A user exists with that email address"}));
                            }
                            else {
                                let email_length = email.length;
                                if (email_length > 9 && email.slice(email_length - 9) === '@nass.gov') {
                                    ret_l.email = email;
                                }
                                else {
                                    valid = false;
                                    res.send(JSON.stringify({success: false, reason: "Non-official email address provided"}));
                                }
                            }
                        }
                        if (f_name !== ret_l.f_name) {
                            changed = true;
                            if (wsp.test(f_name)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: "First Name must be filled out"}));
                            }
                            else {
                                ret_l.f_name = f_name;
                                ret_l.lc_f_name = f_name.toLowerCase();
                                ret_l.full_name = f_name + ' ' + ret_l.l_name;
                            }
                        }
                        if (l_name !== ret_l.l_name) {
                            changed = true;
                            if (wsp.test(l_name)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: "Last Name must be filled out"}));
                            }
                            else {
                                ret_l.l_name = l_name;
                                ret_l.lc_l_name = l_name.toLowerCase();
                                ret_l.full_name = ret_l.f_name + ' ' + l_name;
                            }
                        }
                        if (gender !== ret_l.gender) {
                            changed = true;
                            if (wsp.test(gender)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: "Gender must be selected"}));
                            }
                            else {
                                if (gender === 'f' && ret_l.avatar === 'img/png/avatar.png') {
                                    ret_l.avatar = 'img/png/avatar-1.png';
                                }
                                else if (gender === 'm' && ret_l.avatar === 'img/png/avatar-1.png') {
                                    ret_l.avatar = 'img/png/avatar.png';
                                }
                                ret_l.gender = gender;
                            }
                        }
                        if (!wsp.test(password)) {
                            if (hash.verify(password, ret_l.password)) {
                                //valid. Can change if wants to
                                if (!wsp.test(n_pass)) {
                                    changed = true;
                                    ret_l.password = hash.generate(n_pass);
                                }
                            }
                            else {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: "Incorrect Password"}));
                            }
                        }

                        if (valid && changed) {
                            update(ret_l);
                        }
                        else if (valid && !changed) {
                            res.send(JSON.stringify({success: false, reason: "No changes made"}));
                        }
                    }

                    checks();

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

                    function update(legislator) {
                        legislators.findOneAndUpdate({ code: code }, legislator, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                item.notif = "Successful!";
                                req.legislator.user = legislator;
                                res.send(JSON.stringify({success: true, item: item}));
                                ripple('l', ret_l_p, ret_l);
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