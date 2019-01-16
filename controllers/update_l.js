const hash = require('password-hash');

const generals = require('./schemas/general');
const legislators = require('./schemas/legislators');
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
        if (req.legislator.user) {
            let code = req.legislator.user.code;
            legislators.findOne({ code: code }, (err, ret_l) => {
                let ret_l_p = JSON.parse(JSON.stringify(ret_l));
                if (err) {
                    throw err;
                }
                else {
                    if (ret_l.bio !== bio || fPath) {
                        ret_l.bio = bio;
                        if (fPath) {
                            ret_l.avatar = fPath;
                        }

                        legislators.findOneAndUpdate({ code: code }, ret_l, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                req.notifications.notif = "Successful!";
                                req.legislator.user = ret_l;
                                res.redirect('/settings/' + code);
                                ripple('l', ret_l_p, ret_l);
                            }
                        });
                    }
                    else {
                        res.redirect('/settings/' + code);
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
            req.notifications.notif = "Mandatory fields not filled out";
            res.redirect(req.referer);
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
                                req.notifications.notif = "A user exists with that email address";
                                res.redirect('/settings/' + code);
                            }
                            else {
                                let email_length = email.length;
                                if (email_length > 9 && email.slice(email_length - 9) === '@nass.gov') {
                                    ret_l.email = email;
                                }
                                else {
                                    valid = false;
                                    req.notifications.notif = "Non-official email address provided";
                                    res.redirect('/settings/' + code);
                                }
                            }
                        }
                        if (f_name !== ret_l.f_name) {
                            changed = true;
                            if (wsp.test(f_name)) {
                                valid = false;
                                req.notifications.notif = "First Name must be filled out";
                                res.redirect('/settings/' + code);
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
                                req.notifications.notif = "Last Name must be filled out";
                                res.redirect('/settings/' + code);
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
                                req.notifications.notif = "Gender must be selected";
                                res.redirect('/settings/' + code);
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
                                req.notifications.notif = "Incorrect Password";
                                res.redirect('/settings/' + code);
                            }
                        }

                        if (valid && changed) {
                            update(ret_l);
                        }
                        else if (valid && !changed) {
                            req.notifications.notif = "No changes made";
                            res.redirect('/settings/' + code);
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
                                req.notifications.notif = "Successful!";
                                req.legislator.user = legislator;
                                res.redirect('/settings/' + legislator.code);
                                ripple('l', ret_l_p, ret_l);
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