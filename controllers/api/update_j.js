const hash = require('password-hash');

const districts = require('../schemas/districts');
const generals = require('../schemas/general');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const ripple = require('../ripple');

function update(req, res) {
    let item = {};
    let sect = req.params.upd_type;

    if (sect == 'bio') {
        let bio = req.body.bio;

        let wsp = /^\s*$/g;
        bio.replace(wsp, '');
        if (req.journalist.user) {
            let username = req.journalist.user.username;
            journalists.findOne({ username: username }, (err, ret_j) => {
                let ret_j_p = JSON.parse(JSON.stringify(ret_j));
                if (err) {
                    throw err;
                }
                else {
                    if (ret_j.bio !== bio) {
                        ret_j.bio = bio;

                        journalists.findOneAndUpdate({ username: username }, ret_j, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                item.notif = "Successful!";
                                req.journalist.user = ret_j;
                                res.send(JSON.stringify({success: true, item: item}));
                                ripple('j', ret_j_p, ret_j);
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
        let { f_name, l_name, username, email, password, n_pass, org, beat } = req.body;
        let full_name = f_name + ' ' + l_name;
        let wsp = /^\s*$/;
        
        let test = (text) => {
            return wsp.test(text);
        }
        if (test(f_name) || test(l_name) || test(username) || test(email) || (test(org) || test(beat))) {
            res.send(JSON.stringify({success: false, reason: 'Mandatory fields not filled out'}));
        }
        else if (req.journalist.user) {
            let curr_username = req.journalist.user.username;
            journalists.findOne({ username: curr_username }, (err, ret_j) => {
                let ret_j_p = JSON.parse(JSON.stringify(ret_j));
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
                                res.send(JSON.stringify({success: false, reason: 'A user exists with that username'}));
                            }
                            else {
                                ret_j.username = username;
                            }
                        }
                        if (email !== ret_j.email) {
                            changed = true;
                            let found = await check_email(email);
                            if (found) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'A user exists with that email address'}));
                            }
                            else {
                                ret_j.email = email;
                            }
                        }
                        if (f_name !== ret_j.f_name) {
                            changed = true;
                            if (wsp.test(f_name)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'First Name must be filled out'}));
                            }
                            else {
                                ret_j.f_name = f_name;
                                ret_j.lc_f_name = f_name.toLowerCase();
                                ret_j.full_name = full_name;
                            }
                        }
                        if (l_name !== ret_j.l_name) {
                            changed = true;
                            if (wsp.test(l_name)) {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'Last Name must be filled out'}));
                            }
                            else {
                                ret_j.l_name = l_name;
                                ret_j.lc_l_name = l_name.toLowerCase();
                                ret_j.full_name = full_name;
                            }
                        }
                        if (ret_j.account.type === 'formal' && org !== ret_j.organisation) {
                            changed = true;
                            if (!wsp.test(org)) {
                                let found = await check_org(org);
                                if (found.status) {
                                    let ret_o = found.obj;
                                    ret_j.organisation = ret_o.username;
                                    ret_j.orgName = ret_o.name;
                                    ret_j.description = `${ret_o.name} Journalist`;
                                    ret_j.verified = ret_o.verification.verified;
                                    ret_j.beat = '';
                                    ret_j.beatName = '';
                                    ret_j.beatDets = new Object();
                                }
                                else {
                                    valid = false;
                                    res.send(JSON.stringify({success: false, reason: 'Invalid Organisation'}));
                                }
                            }
                        }
                        if (ret_j.account.type === 'freelance' && beat !== ret_j.beat) {
                            changed = true;
                            if (!wsp.test(beat)) {
                                let found = await check_beat(beat);
                                if (found.status) {
                                    let ret_d = found.obj;
                                    ret_j.beat = beat;
                                    ret_j.beatName = ret_d.name;
                                    ret_j.beatDets = {
                                        state: ret_d.state,
                                        state_code: ret_d.state_code,
                                        const_num: ret_d.const_num,
                                        dist_code: ret_d.dist_code,
                                        type: ret_d.type,
                                        type_name: ret_d.type_name,
                                        name: ret_d.name,
                                        f_name: ret_d.f_name
                                    };
                                }
                                else {
                                    valid = false;
                                    res.send(JSON.stringify({success: false, reason: 'Invalid District'}));
                                }
                            }
                        }
                        if (!wsp.test(password)) {
                            if (hash.verify(password, ret_j.password)) {
                                //valid. Can change if wants to
                                if (!wsp.test(n_pass)) {
                                    changed = true;
                                    ret_j.password = hash.generate(n_pass);
                                }
                            }
                            else {
                                valid = false;
                                res.send(JSON.stringify({success: false, reason: 'Incorrect Password'}));
                            }
                        }

                        if (valid && changed) {
                            update(ret_j);
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

                    function check_org(username) {
                        return new Promise((resolve, reject) => {
                            organisations.findOne({ username: username }, (err, ret_o) => {
                                if (err) {
                                    reject(err);
                                }
                                else if (!ret_o) {
                                    resolve({ status: false });
                                }
                                else {
                                    resolve({ status: true, obj: ret_o });
                                }
                            });
                        });
                    }

                    function check_beat(code) {
                        return new Promise((resolve, reject) => {
                            districts.findOne({ code: code }, (err, ret_d) => {
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

                    function update(journo) {
                        journalists.findOneAndUpdate({ username: curr_username }, journo, (err) => {
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
                                                req.journalist.user = journo;
                                                item.notif = "Successful!";
                                                res.send(JSON.stringify({success: true, item: item}));
                                                ripple('j', ret_j_p, ret_j);
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
            res.send(JSON.stringify({success: false, reason: 'Invalid Parameters'}));
        }
    }
}

module.exports = update;