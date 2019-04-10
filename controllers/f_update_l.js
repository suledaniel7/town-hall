const hash = require('password-hash');

const generals = require('./schemas/general');
const legislators = require('./schemas/legislators');
const ripple = require('./ripple');

function update(req, res) {
    let { f_name, l_name, email, password, gender, code } = req.body;
    let wsp = /^\s*$/;
    let test = (text) => {
        return wsp.test(text);
    }
    if (test(f_name) || test(l_name) || test(email) || test(gender) || test(code)) {
        req.notifications.isNotif = false;
        req.notifications.notif = "Mandatory fields not filled out";
        res.redirect('/admin/force');
    }
    legislators.findOne({ code: code }, (err, ret_l) => {
        let ret_l_p = JSON.parse(JSON.stringify(ret_l));
        if (err) {
            throw err;
        }
        else if(!ret_l){
            req.notifications.isNotif = false;
            req.notifications.notif = "Invalid User Account selected";
            res.redirect('/admin/force');
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
                        req.notifications.isNotif = false;
                        req.notifications.notif = "A user exists with that email address";
                        res.redirect('/admin/force');
                    }
                    else {
                        let email_length = email.length;
                        if (email_length > 9 && email.slice(email_length - 9) === '@nass.gov') {
                            ret_l.email = email;
                        }
                        else {
                            valid = false;
                            req.notifications.isNotif = false;
                            req.notifications.notif = "Non-official email address provided";
                            res.redirect('/admin/force');
                        }
                    }
                }
                if (f_name !== ret_l.f_name) {
                    changed = true;
                    if (wsp.test(f_name)) {
                        valid = false;
                        req.notifications.isNotif = false;
                        req.notifications.notif = "First Name must be filled out";
                        res.redirect('/admin/force');
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
                        req.notifications.isNotif = false;
                        req.notifications.notif = "Last Name must be filled out";
                        res.redirect('/admin/force');
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
                        req.notifications.isNotif = false;
                        req.notifications.notif = "Gender must be selected";
                        res.redirect('/admin/force');
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
                    changed = true;
                    ret_l.password = hash.generate(password);
                }

                if (valid && changed) {
                    update(ret_l);
                }
                else if (valid && !changed) {
                    req.notifications.isNotif = true;
                    req.notifications.notif = "No changes made";
                    res.redirect('/admin/force');
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
                        req.notifications.isNotif = true;
                        req.notifications.notif = "Successful!";
                        res.redirect('/admin/force');
                        ripple('l', ret_l_p, ret_l);
                    }
                });
            }
        }
    });
}

module.exports = update;