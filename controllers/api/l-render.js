const legislators = require('../schemas/legislators');
const districts = require('../schemas/districts');
const messages = require('../schemas/messages');
const findUser = require('./findUser');

function renderProfile(req, res, code, user, c_username) {
    let item = {};
    legislators.findOne({ code: code }, (err, ret_l) => {
        if (err) {
            throw err;
        }
        else if (!ret_l) {
            res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));//explain what happened
        }
        else {
            if (user) {
                item.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if (source == ret_l.code) {
                        flag = true;
                    }
                });
                if (user.districts.indexOf(code) != -1) {
                    flag = true;
                }
                item.following = flag;
            }
            ret_l.likes = null;
            ret_l.dislikes = null;
            ret_l.password = null;

            districts.findOne({ code: code }, (err, ret_d) => {
                if (err) {
                    throw err;
                }
                else if (!ret_d) {
                    console.log("Significant error. Cannot find district for legislator bearing code:", code);
                    res.send(JSON.stringify({ success: false, reason: "Invalid Account District" }));
                }
                else {
                    item.const_num = ret_d.const_num;

                    messages.find({ sender: code }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            // let tmpMsgs = extractTags(ret_msgs, null);
                            // item.messages = extractMentions(tmpMsgs);
                            item.messages = ret_msgs;
                            item.user = ret_l;
                            item.username = c_username;

                            retrieveReporting(code);
                            async function retrieveReporting(code) {
                                let ret_user = await findUser(req);
                                if (!ret_user) {
                                    res.send(JSON.stringify({success: false, reason: "You must be signed in to access this function"}));
                                }
                                else {
                                    let username = ret_user.username;
                                    if (!username) {
                                        username = ret_user.code;
                                    }

                                    messages.find({ $or: [{ beats: code }, { mentions: code }] }).sort({ timestamp: -1 }).exec((err, ret_b_msgs) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            item.b_msgs = ret_b_msgs;
                                            res.send(JSON.stringify({ success: true, ac_type: 'l', item: item }));
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }
    });
}

module.exports = renderProfile;