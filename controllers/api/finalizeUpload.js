const fs = require('fs');
const path = require('path');
const users = require('../schemas/users');
const organisations = require('../schemas/organisations');
const journalists = require('../schemas/journalists');
const legislators = require('../schemas/legislators');
const findActive = require('./findActive');
const convertPath = require('./uploadFilePathConversion');
const ripple = require('../ripple');

function finalize(req, res) {
    let u_type = findActive(req, res);
    let file = req.body.file;
    let av_f = '';

    if (file) {
        if (u_type === 'user') {
            av_f = 'u_avatars';
            let username = req.user.user.username;
            users.findOne({ username: username }, (err, ret_u) => {
                if (err) {
                    res.send({ success: false, reason: "An error occured on our end" });
                    throw err;
                }
                else if (!ret_u) {
                    res.send({ success: false, reason: "You must be signed in to access this feature" });
                }
                else {
                    let prev = JSON.parse(JSON.stringify(ret_u));
                    copyFile().then((fPath) => {
                        ret_u.avatar = fPath;
                        users.findOneAndUpdate({ username: username }, ret_u, (err) => {
                            if (err) {
                                res.send({ success: false, reason: "An error occured on our end. Please try again" });
                                throw err;
                            }
                            else {
                                let curr = ret_u;
                                res.send({ success: true, username: username });
                                ripple('u', prev, curr);
                            }
                        });
                    }).catch(reason => {
                        res.send({ success: false, reason: reason });
                    });
                }
            });
        }
        else if (u_type === 'organisation') {
            av_f = 'logos';
            let username = req.organisation.user.username;
            organisations.findOne({ username: username }, (err, ret_o) => {
                if (err) {
                    res.send({ success: false, reason: "An error occured on our end" });
                    throw err;
                }
                else if (!ret_o) {
                    res.send({ success: false, reason: "You must be signed in to access this feature" });
                }
                else {
                    let prev = JSON.parse(JSON.stringify(ret_o));
                    copyFile().then((fPath) => {
                        ret_o.logo = fPath;
                        organisations.findOneAndUpdate({ username: username }, ret_o, (err) => {
                            if (err) {
                                res.send({ success: false, reason: "An error occured on our end. Please try again" });
                                throw err;
                            }
                            else {
                                let curr = ret_o;
                                res.send({ success: true, username: username });
                                ripple('o', prev, curr);
                            }
                        });
                    }).catch(reason => {
                        res.send({ success: false, reason: reason });
                    });
                }
            });
        }
        else if (u_type === 'journalist') {
            av_f = 'j_avatars';
            let username = req.journalist.user.username;
            journalists.findOne({ username: username }, (err, ret_j) => {
                if (err) {
                    res.send({ success: false, reason: "An error occured on our end" });
                    throw err;
                }
                else if (!ret_j) {
                    res.send({ success: false, reason: "You must be signed in to access this feature" });
                }
                else {
                    let prev = JSON.parse(JSON.stringify(ret_j));
                    copyFile().then((fPath) => {
                        ret_j.avatar = fPath;
                        journalists.findOneAndUpdate({ username: username }, ret_j, (err) => {
                            if (err) {
                                res.send({ success: false, reason: "An error occured on our end. Please try again" });
                                throw err;
                            }
                            else {
                                let curr = ret_j;
                                res.send({ success: true, username: username });
                                ripple('j', prev, curr);
                            }
                        });
                    }).catch(reason => {
                        res.send({ success: false, reason: reason });
                    });
                }
            });
        }
        else if (u_type === 'legislator') {
            av_f = 'l_avatars';
            let code = req.legislator.user.code;
            legislators.findOne({ code: code }, (err, ret_l) => {
                if (err) {
                    res.send({ success: false, reason: "An error occured on our end" });
                    throw err;
                }
                else if (!ret_l) {
                    res.send({ success: false, reason: "You must be signed in to access this feature" });
                }
                else {
                    let prev = JSON.parse(JSON.stringify(ret_l));
                    copyFile().then((fPath) => {
                        ret_l.avatar = fPath;
                        legislators.findOneAndUpdate({ code: code }, ret_l, (err) => {
                            if (err) {
                                res.send({ success: false, reason: "An error occured on our end. Please try again" });
                                throw err;
                            }
                            else {
                                let curr = ret_l;
                                res.send({ success: true, username: code });
                                ripple('l', prev, curr);
                            }
                        });
                    }).catch(reason => {
                        res.send({ success: false, reason: reason });
                    });
                }
            });
        }
        else {
            res.send({ success: false, reason: "You must be signed in to access this feature" });
        }

        function copyFile() {
            let fPath = path.join(__dirname, '../../public/tmp_avatars/') + file.filename;
            file.path = `public/${av_f}/${file.filename}`;
            file.destination = `public/${av_f}/`;
            let dest = convertPath(file);
            let final_dest = path.join(__dirname, '../../public/', dest);

            return new Promise((resolve, reject) => {
                fs.copyFile(fPath, final_dest, (err) => {
                    if (err) {
                        reject("An error occured on our end. Please try again shortly");
                        throw err;
                    }
                    else {
                        fs.exists(final_dest, (exists) => {
                            if (exists) {
                                fs.unlink(fPath, (err) => {
                                    if (err) {
                                        reject("An error occured on our end. Please try again shortly");
                                        throw err;
                                    }
                                    else {
                                        resolve(dest);
                                    }
                                });
                            }
                            else {
                                reject("An error occured on our end in uploading the file. Please try again shortly");
                                console.log("Problem with copying file:", fPath);
                            }
                        });
                    }
                });
            });
        }
    }
    else {
        res.send({ success: false, reason: "No file selected" });
    }
}

module.exports = finalize;