const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const findType = require('./findType');

function blockFn(req, res) {
    let sender = req.body.sender;
    let recepient = req.body.recepient;

    findType(sender).then((s_type) => {
        if (!s_type) {
            res.send(JSON.stringify({ success: false, reason: "You must be signed in to perform this operation" }));
        }
        else {
            s_type = s_type[0];

            let obtainUser = (u_type, username) => {
                return new Promise((resolve, reject) => {
                    if (u_type === 'u') {
                        users.findOne({ username: username }, (err, ret_u) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!ret_u) {
                                resolve(null);
                            }
                            else {
                                resolve(ret_u);
                            }
                        });
                    }
                    else if (u_type === 'j') {
                        journalists.findOne({ username: username }, (err, ret_j) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!ret_j) {
                                resolve(null);
                            }
                            else {
                                resolve(ret_j);
                            }
                        });
                    }
                    else if (u_type === 'l') {
                        legislators.findOne({ code: username }, (err, ret_l) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!ret_l) {
                                resolve(null);
                            }
                            else {
                                resolve(ret_l);
                            }
                        });
                    }
                    else if (u_type === 'o') {
                        organisations.findOne({ username: username }, (err, ret_o) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!ret_o) {
                                resolve(null);
                            }
                            else {
                                resolve(ret_o);
                            }
                        });
                    }
                    else {
                        resolve(null);
                    }
                });
            }

            let updateUser = (u_type, username, user) => {
                return new Promise((resolve, reject) => {
                    if (u_type === 'u') {
                        users.findOneAndUpdate({ username: username }, user, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                    else if (u_type === 'j') {
                        journalists.findOneAndUpdate({ username: username }, user, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                    else if (u_type === 'l') {
                        legislators.findOneAndUpdate({ code: username }, user, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                    else if (u_type === 'o') {
                        organisations.findOneAndUpdate({ username: username }, user, (err) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    }
                    else {
                        resolve(false);
                    }
                });
            }

            obtainUser(s_type, sender).then((ret_sen) => {
                if (!ret_sen) {
                    res.send(JSON.stringify({ success: false, reason: "Invalid User" }));
                }
                else {
                    let blocked = ret_sen.blocked;

                    let b_op = req.params.b_type;

                    if (b_op === 'b') {
                        //block
                        let changed = false;
                        if (blocked) {
                            if (blocked.indexOf(recepient) !== -1) {
                                res.send(JSON.stringify({ success: false, reason: "You have already blocked this Account from Messaging you" }));
                            }
                            else {
                                ret_sen.blocked.push(recepient);
                                changed = true;
                            }
                        }
                        else {
                            ret_sen.blocked = [recepient];
                            changed = true;
                        }
                        //update and respond
                        if (changed) {
                            updateUser(s_type, sender, ret_sen).then((success) => {
                                if (success) {
                                    res.send(JSON.stringify({success: true}));
                                }
                                else {
                                    res.send(JSON.stringify({ success: false, reason: "An error occured in retrieving your details. Please try again" }));
                                }
                            }).catch(ret_err => {
                                console.log(ret_err);
                                res.send(JSON.stringify({ success: false, reason: "An error occured in retrieving your details. Please try again" }));
                            });
                        }
                    }
                    else {
                        //unblock
                        let changed = false;
                        if (blocked) {
                            if (blocked.indexOf(recepient) === -1) {
                                res.send(JSON.stringify({ success: false, reason: "You have not blocked this Account from Messaging you" }));
                            }
                            else {
                                let index = blocked.indexOf(recepient);
                                ret_sen.blocked.splice(index, 1);
                                changed = true;
                            }
                        }
                        else {
                            res.send(JSON.stringify({ success: false, reason: "You have not blocked this Account from Messaging you" }));
                        }
                        if (changed) {
                            updateUser(s_type, sender, ret_sen).then((success) => {
                                if (success) {
                                    res.send(JSON.stringify({success: true}));
                                }
                                else {
                                    res.send(JSON.stringify({ success: false, reason: "An error occured in retrieving your details. Please try again" }));
                                }
                            }).catch(ret_err => {
                                console.log(ret_err);
                                res.send(JSON.stringify({ success: false, reason: "An error occured in retrieving your details. Please try again" }));
                            });
                        }
                    }
                }
            }).catch(ret_e => {
                res.send(JSON.stringify({ success: false, reason: "Invalid Account Type" }));
                console.log(ret_e);
            });
        }
    });
}

module.exports = blockFn;