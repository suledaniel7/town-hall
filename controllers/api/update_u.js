const hash = require('password-hash');

const districts = require('../schemas/districts');
const states = require('../schemas/states');
const generals = require('../schemas/general');
const users = require('../schemas/users');
const ripple = require('../ripple');

function update(req, res) {
    let item = {};
    let ch_dist = false;
    if (req.user) {
        let { bio, f_name, username, email, password, n_pass, state, fed_const, sen_dist, gender } = req.body;
        let wsp = /^\s*$/;
        let test = (text) => {
            return wsp.test(text);
        }
        if (test(f_name) || test(username) || test(email) || test(state) || test(fed_const) || test(sen_dist)) {
            res.send(JSON.stringify({success: false, reason: 'Mandatory fields not filled out'}));
        }
        else if (req.user.user) {
            let curr_username = req.user.user.username;
            users.findOne({ username: curr_username }, (err, ret_u) => {
                let ret_u_p = JSON.parse(JSON.stringify(ret_u));
                if (err) {
                    throw err;
                }
                else {
                    let changed = false;
                    let valid = true;
                    async function checks() {
                        if(!wsp.test(bio) || bio !== ret_u.bio){
                            changed = true;
                            ret_u.bio = bio;
                        }
                        if (username !== curr_username) {
                            changed = true;
                            let found = await check_username(username);
                            if (found) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'A user exists with that username'}));
                            }
                            else {
                                ret_u.username = username;
                            }
                        }
                        if (email !== ret_u.email) {
                            changed = true;
                            let found = await check_email(email);
                            if (found) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'A user exists with that email address'}));
                            }
                            else {
                                ret_u.email = email;
                            }
                        }
                        if (f_name !== ret_u.f_name) {
                            changed = true;
                            if (wsp.test(f_name)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'First Name must be filled out'}));
                            }
                            else {
                                ret_u.f_name = f_name;
                                ret_u.lc_f_name = f_name.toLowerCase();
                            }
                        }
                        if (gender !== ret_u.gender) {
                            changed = true;
                            if (wsp.test(gender)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'Gender must be selected'}));
                            }
                            else {
                                if (gender === 'f' && ret_u.avatar === 'img/png/avatar.png') {
                                    ret_u.avatar = 'img/png/avatar-1.png';
                                }
                                else if (gender === 'm' && ret_u.avatar === 'img/png/avatar-1.png') {
                                    ret_u.avatar = 'img/png/avatar.png';
                                }
                                ret_u.gender = gender;
                            }
                        }
                        if (state !== ret_u.state_code) {
                            changed = true;
                            if (wsp.test(state)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'State must be selected'}));
                            }
                            else {
                                let found = await check_state(state);
                                if(found.status){
                                    let ret_s = found.obj;
                                    ret_u.state = ret_s.name;
                                    ret_u.state_code = ret_s.state_code;
                                    ch_dist = true;
                                }
                                else {
                                    valid = false;
                                    res.send(JSON.stringify({success: false, reason: 'Invalid State selected'}));
                                }
                            }
                        }
                        if (fed_const !== ret_u.fed_const || changed) {
                            changed = true;
                            if (wsp.test(fed_const)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'Federal Constituency must be selected'}));
                            }
                            else {
                                let found = await check_dist(fed_const, state);
                                if(found.status){
                                    ret_u.fed_const = fed_const;
                                    ch_dist = true;
                                }
                                else {
                                    valid = false;
                                    res.send(JSON.stringify({success: false, reason: 'Invalid Federal Constituency'}));
                                }
                            }
                        }
                        if (sen_dist !== ret_u.sen_dist || changed) {
                            changed = true;
                            if (wsp.test(sen_dist)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'Senatorial District must be selected'}));
                            }
                            else {
                                let found = await check_dist(sen_dist, state);
                                if(found.status){
                                    ret_u.sen_dist = sen_dist;
                                    ch_dist = true;
                                }
                                else {
                                    valid = false;
                                    res.send(JSON.stringify({success: false, reason: 'Invalid Senatorial District'}));
                                }
                            }
                        }
                        if (!wsp.test(password)) {
                            if (hash.verify(password, ret_u.password)) {
                                //valid. Can change if wants to
                                if (!wsp.test(n_pass)) {
                                    changed = true;
                                    ret_u.password = hash.generate(n_pass);
                                }
                            }
                            else {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'Incorrect Password'}));
                            }
                        }

                        if (valid && changed) {
                            update(ret_u);
                        }
                        else if (valid && !changed) {
                            res.send(JSON.stringify({success: false, reason: 'No changes made'}));
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

                    function check_state(code) {
                        return new Promise((resolve, reject) => {
                            states.findOne({ state_code: code }, (err, ret_s) => {
                                if (err) {
                                    reject(err);
                                }
                                else if (!ret_s) {
                                    resolve({ status: false });
                                }
                                else {
                                    resolve({ status: true, obj: ret_s });
                                }
                            });
                        });
                    }

                    function check_dist(code, st_code) {
                        return new Promise((resolve, reject) => {
                            districts.findOne({ code: code, state_code: st_code }, (err, ret_d) => {
                                if (err) {
                                    reject(err);
                                }
                                else if (!ret_d) {
                                    resolve({ status: false });
                                }
                                else {
                                    resolve({ status: true, obj: ret_d });
                                }
                            });
                        });
                    }

                    function update(user) {
                        users.findOneAndUpdate({ username: curr_username }, user, (err) => {
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
                                                req.user.user = user;
                                                item.notif = "Successful!";
                                                let logout = false;
                                                if(ret_u_p.username !== ret_u.username){
                                                    logout = true;
                                                }
                                                res.send(JSON.stringify({success: true, logout: logout, item: item, ch_dist: ch_dist}));
                                                ripple('u', ret_u_p, ret_u);
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
    else {
        res.send(JSON.stringify({success: false, reason: "Invalid User"}));
    }
}

module.exports = update;