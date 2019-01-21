const general = require('./schemas/general');
const comments = require('./schemas/comments');
const journalists = require('./schemas/journalists');
const organisations = require('./schemas/organisations');
const users = require('./schemas/users');
const messages = require('./schemas/messages');
const reports = require('./schemas/reports');
const districts = require('./schemas/districts');
const legislators = require('./schemas/legislators');

function ripple(ac_type, prev, curr) {
    if (ac_type == 'o') {
        let p_username = prev.username;
        let c_username = curr.username;

        comments.find({ sender: p_username }, (err, ret_cs) => {
            if (err) {
                throw err;
            }
            else {
                if (ret_cs.length > 0) {
                    for (let i = 0; i < ret_cs.length; i++) {
                        let comment = ret_cs[i];

                        comment.sender = c_username;
                        comment.sender_name = curr.name;
                        comment.sender_avatar = curr.logo;
                        comment.verified = curr.verification.verified;
                        //we choose to leave timestamps as they are
                        //except if we put in the sender of the message, then we can change t/stamps

                        comments.findOneAndUpdate({ c_timestamp: comment.c_timestamp }, comment, (err) => {
                            if (err) {
                                throw err;
                            }
                        });

                    }
                }
            }
        });

        //messages
        //sender, sender_name, sender_avatar, verified
        messages.find({ sender: p_username }, (err, ret_ms) => {
            if (err) {
                throw err;
            }
            else {
                if (ret_ms.length > 0) {
                    for (let i = 0; i < ret_ms.length; i++) {
                        let message = ret_ms[i];

                        message.sender = c_username;
                        message.sender_name = curr.name;
                        message.sender_avatar = curr.logo;
                        message.verified = curr.verification.verified;

                        messages.findOneAndUpdate({ m_timestamp: message.m_timestamp }, message, (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            }
        });

        //journos: organisation, orgName, verified
        journalists.find({ organisation: p_username }, (err, ret_js) => {
            if (err) {
                throw err;
            }
            else {
                if (ret_js.length > 0) {
                    for (let i = 0; i < ret_js.length; i++) {
                        let journalist = ret_js[i];

                        journalist.organisation = c_username;
                        journalist.orgName = curr.name;
                        journalist.verified = curr.verification.verified;

                        journalists.findOneAndUpdate({ username: journalist.username }, journalist, (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            }
        });

        //users: sources
        users.find({ sources: p_username }, (err, ret_us) => {
            if (err) {
                throw err;
            }
            else {
                if (ret_us.length > 0) {
                    for (let i = 0; i < ret_us.length; i++) {
                        let user = ret_us[i];

                        let index = user.sources.indexOf(p_username);
                        if (index !== -1) {
                            user.sources[index] = c_username;

                            users.findOneAndUpdate({ username: user.username }, user, (err) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            console.log(`Error occured in finding source, ${p_username} for user, ${user.username}, when the former was updated to ${c_username}`);
                        }
                    }
                }
            }
        });

        //reports: message_sender, reported_by

        reports.find({ $or: [{ message_sender: p_username }, { reported_by: p_username }] }, (err, ret_rs) => {
            if (err) {
                throw err;
            }
            else {
                if (ret_rs.length > 0) {
                    for (let i = 0; i < ret_rs.length; i++) {
                        let report = ret_rs[i];

                        if (report.message_sender === p_username) {
                            report.message_sender = c_username;
                        }
                        for (let j = 0; j < report.reported_by.length; j++) {
                            if (report.reported_by[j].r === p_username) {
                                report.reported_by[j].r = c_username;
                            }
                        }

                        reports.findOneAndUpdate({ m_timestamp: report.m_timestamp }, report, (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            }
        });

    }
    else if (ac_type == 'j') {
        let p_username = prev.username;
        let c_username = curr.username;
        let p_org = prev.organisation;
        let c_org = curr.organisation;
        let p_avatar = prev.avatar;
        let c_avatar = curr.avatar;
        let verified = curr.verified;

        // Comments: sender, sender_name, sender_avatar, verified
        comments.find({ sender: p_username }, (err, ret_cs) => {
            if (err) {
                throw err;
            }
            else if (ret_cs.length > 0 && (p_username !== c_username || p_avatar !== c_avatar)) {
                for (let i = 0; i < ret_cs.length; i++) {
                    let comment = ret_cs[i];
                    comment.sender = c_username;
                    comment.sender_name = curr.full_name;
                    comment.sender_avatar = c_avatar;
                    comment.verified = verified;

                    comments.findOneAndUpdate({ c_timestamp: comment.c_timestamp }, comment, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        });
        // Messages: sender, sender_name, sender_avatar, sender_position, verified
        messages.find({ sender: p_username }, (err, ret_ms) => {
            if (err) {
                throw err;
            }
            else if (ret_ms.length > 0) {
                for (let i = 0; i < ret_ms.length; i++) {
                    let message = ret_ms[i];
                    message.sender = c_username;
                    message.sender_name = curr.full_name;
                    message.sender_avatar = c_avatar;
                    message.verified = verified;
                    let d = new Date();
                    if (curr.account.type === 'formal' && p_org !== c_org) {
                        let swps = message.switchoverPoints;
                        let lgt = swps.length;
                        if (lgt > 0) {
                            //changed org before. Change only greater
                            let final = swps[lgt - 1];
                            if (message.timestamp > final) {
                                let f_l = prev.orgName[0];
                                f_l = f_l.toLowerCase();
                                let an_s = /a|e|f|h|i|l|m|n|o|r|s|x|8/;
                                message.switchoverPoints.push(d.getTime());
                                if (an_s.test(f_l)) {
                                    message.sender_position = `As an ${prev.orgName} Journalist`;
                                }
                                else {
                                    message.sender_position = `As a ${prev.orgName} Journalist`;
                                }
                            }
                        }
                        else {
                            let f_l = prev.orgName[0];
                            f_l = f_l.toLowerCase();
                            let an_s = /a|e|f|h|i|l|m|n|o|r|s|x|8/;
                            message.switchoverPoints.push(d.getTime());
                            if (an_s.test(f_l)) {
                                message.sender_position = `As an ${prev.orgName} Journalist`;
                            }
                            else {
                                message.sender_position = `As a ${prev.orgName} Journalist`;
                            }
                        }
                    }

                    messages.findOneAndUpdate({ m_timestamp: message.m_timestamp }, message, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        });
        // Organisations
        if (p_org === c_org) {
            // Organisations: pendingBeat, journalists, pending_reqs
            organisations.findOne({ username: p_org }, (err, ret_o) => {
                if (err) {
                    throw err;
                }
                else if (!ret_o) {
                    console.log(`An error occured finding the registered organisation ${p_org} for ${c_username}`);
                }
                else {
                    //pendingBeat
                    if (ret_o.pending_beat) {
                        if (ret_o.pending_beat.status && ret_o.pending_beat.username === p_username) {
                            ret_o.pending_beat.username = c_username;
                        }
                    }
                    //journalists
                    for (let i = 0; i < ret_o.journalists.length; i++) {
                        if (ret_o.journalists[i].username === p_username) {
                            ret_o.journalists[i].username = c_username;
                        }
                    }
                    //pending_reqs
                    for (let i = 0; i < ret_o.pending_reqs.length; i++) {
                        if (ret_o.pending_reqs[i].username === p_username) {
                            ret_o.pending_reqs[i].username = c_username;
                        }
                    }

                    organisations.findOneAndUpdate({ username: p_org }, ret_o, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            });
        }
        else {
            // Organisations - changed org: journo_num, districts, journalists, pending_reqs, pendingBeat, send request
            organisations.findOne({ username: p_org }, (err, ret_o) => {
                if (err) {
                    throw err;
                }
                else if (!ret_o) {
                    console.log(`Couldn't find org, ${p_org} for journalist, ${c_username}`);
                }
                else {
                    //remove journo from prev org
                    let journalistsArr = ret_o.journalists;
                    let pendingReqs = ret_o.pending_reqs;
                    let pendingBeat = ret_o.pendingBeat;
                    let covered_dists = [];

                    for (let i = 0; i < journalistsArr.length; i++) {
                        if (journalistsArr[i].username === p_username) {
                            journalistsArr.splice(i, 1);
                            ret_o.journo_num--;
                        }
                        else {
                            let beat = journalistsArr[i].beat;
                            if (covered_dists.indexOf(beat) === -1) {
                                covered_dists.push(beat);
                            }
                        }
                    }
                    for (let i = 0; i < pendingReqs.length; i++) {
                        if (pendingReqs[i].username === p_username) {
                            pendingReqs.splice(i, 1);
                        }
                    }
                    if (pendingBeat) {
                        if (pendingBeat.status && pendingBeat.username === p_username) {
                            pendingBeat.status = false;
                            pendingBeat.username = null;
                        }
                    }

                    ret_o.districts = covered_dists;
                    //send req to new org
                    organisations.findOne({ username: c_org }, (err, ret_n_o) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_n_o) {
                            console.log(`Invalid organisation, ${c_org} selected by journalist, ${c_username}`);
                        }
                        else {
                            ret_n_o.pending_reqs.push(curr);

                            organisations.findOneAndUpdate({ username: c_org }, ret_n_o, (err) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                    });

                    organisations.findOneAndUpdate({ username: p_org }, ret_o, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            });
        }
        //users
        users.find({ sources: p_username }, (err, ret_us) => {
            if (err) {
                throw err;
            }
            else if (ret_us.length > 0) {
                for (let i = 0; i < ret_us.length; i++) {
                    let user = ret_us[i];
                    for (let j = 0; j < user.sources.length; j++) {
                        if (user.sources[j] === p_username) {
                            user.sources[j] = c_username;
                        }

                        users.findOneAndUpdate({ username: user.username }, user, (err) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }
            }
        });
        //reports
        reports.find({ $or: [{ message_sender: p_username }, { reported_by: p_username }] }, (err, ret_rs) => {
            if (err) {
                throw err;
            }
            else if (ret_rs.length > 0) {
                for (let i = 0; i < ret_rs.length; i++) {
                    let report = ret_rs[i];
                    if (report.message_sender === p_username) {
                        report.message_sender = c_username;
                    }
                    for (let j = 0; j < report.reported_by.length; j++) {
                        if (report.reported_by[j].r === p_username) {
                            report.reported_by[j].r = c_username;
                        }
                    }

                    reports.findOneAndUpdate({ m_timestamp: report.m_timestamp }, report, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        });
    }
    else if (ac_type == 'u') {
        let p_username = prev.username;
        let c_username = curr.username;
        let p_avatar = prev.avatar;
        let c_avatar = curr.avatar;
        let p_fed_const = prev.fed_const;
        let c_fed_const = curr.fed_const;
        let p_sen_dist = prev.sen_dist;
        let c_sen_dist = curr.sen_dist;

        comments.find({ sender: p_username }, (err, ret_cs) => {
            if (err) {
                throw err;
            }
            else if (ret_cs.length > 0 && (p_username !== c_username || p_avatar !== c_avatar)) {
                for (let i = 0; i < ret_cs.length; i++) {
                    let comment = ret_cs[i];
                    comment.sender = c_username;
                    comment.sender_name = curr.full_name;
                    comment.sender_avatar = c_avatar;
                    comment.verified = false;

                    comments.findOneAndUpdate({ c_timestamp: comment.c_timestamp }, comment, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        });

        reports.find({ $or: [{ message_sender: p_username }, { reported_by: p_username }] }, (err, ret_rs) => {
            if (err) {
                throw err;
            }
            else if (ret_rs.length > 0) {
                for (let i = 0; i < ret_rs.length; i++) {
                    let report = ret_rs[i];
                    if (report.message_sender === p_username) {
                        report.message_sender = c_username;
                    }
                    for (let j = 0; j < report.reported_by.length; j++) {
                        if (report.reported_by[j].r === p_username) {
                            report.reported_by[j].r = c_username;
                        }
                    }

                    reports.findOneAndUpdate({ m_timestamp: report.m_timestamp }, report, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        });

        //fed_const_changed: d_const_num, l_const_num
        if (p_fed_const !== c_fed_const) {
            districts.findOne({ code: p_fed_const }, (err, ret_d) => {
                if (err) {
                    throw err;
                }
                else if (!ret_d) {
                    console.log(`Invalid fed_const, ${p_fed_const} passed all validation and reached ripple for user who changed from ${p_username} to ${c_username}`);
                }
                else {
                    ret_d.const_num--;
                    legislators.findOne({ code: p_fed_const }, (err, ret_l) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_l) {
                            console.log(`Invalid legislator for district ${p_fed_const}`);
                        }
                        else {
                            ret_l.const_num--;
                            legislators.findOneAndUpdate({ code: p_fed_const }, ret_l, (err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    legislators.findOne({ code: c_fed_const }, (err, ret_c_l) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else if (!ret_c_l) {
                                            console.log(`Invalid legislator for district ${c_fed_const}`);
                                        }
                                        else {
                                            ret_c_l.const_num++;
                                            legislators.findOneAndUpdate({ code: c_fed_const }, ret_c_l, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    districts.findOneAndUpdate({ code: p_fed_const }, ret_d, (err) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            districts.findOne({ code: c_fed_const }, (err, ret_c_d) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!ret_c_d) {
                                    console.log(`Invalid fed_const, ${c_fed_const} passed all validation and reached ripple for user who changed from ${p_username} to ${c_username}`);
                                }
                                else {
                                    ret_c_d.const_num++;
                                    districts.findOneAndUpdate({ code: c_fed_const }, ret_c_d, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        //sen_dist_changed: d_const_num, l_const_num
        if (p_sen_dist !== c_sen_dist) {
            districts.findOne({ code: p_sen_dist }, (err, ret_d) => {
                if (err) {
                    throw err;
                }
                else if (!ret_d) {
                    console.log(`Invalid fed_const, ${p_sen_dist} passed all validation and reached ripple for user who changed from ${p_username} to ${c_username}`);
                }
                else {
                    ret_d.const_num--;
                    legislators.findOne({ code: p_sen_dist }, (err, ret_l) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_l) {
                            console.log(`Invalid legislator for district ${p_sen_dist}`);
                        }
                        else {
                            ret_l.const_num--;
                            legislators.findOneAndUpdate({ code: p_sen_dist }, ret_l, (err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    legislators.findOne({ code: c_sen_dist }, (err, ret_c_l) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else if (!ret_c_l) {
                                            console.log(`Invalid legislator for district ${c_sen_dist}`);
                                        }
                                        else {
                                            ret_c_l.const_num++;
                                            legislators.findOneAndUpdate({ code: c_sen_dist }, ret_c_l, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                    districts.findOneAndUpdate({ code: p_sen_dist }, ret_d, (err) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            districts.findOne({ code: c_sen_dist }, (err, ret_c_d) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!ret_c_d) {
                                    console.log(`Invalid fed_const, ${c_sen_dist} passed all validation and reached ripple for user who changed from ${p_username} to ${c_username}`);
                                }
                                else {
                                    ret_c_d.const_num++;
                                    districts.findOneAndUpdate({ code: c_sen_dist }, ret_c_d, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        //journalists
        if (p_username !== c_username) {
            journalists.find((err, ret_js) => {
                if (err) {
                    throw err;
                }
                else {
                    for (let i = 0; i < ret_js.length; i++) {
                        let journo = ret_js[i];
                        let followers = journo.followers;
                        for (let j = 0; j < followers.length; j++) {
                            let follower = followers[j];
                            if (follower === p_username) {
                                followers[j] = c_username;
                                journalists.findOneAndUpdate({ username: journo.username }, journo, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }
        //organisations
        if (p_username !== c_username) {
            organisations.find((err, ret_os) => {
                if (err) {
                    throw err;
                }
                else {
                    for (let i = 0; i < ret_os.length; i++) {
                        let org = ret_os[i];
                        let followers = org.followers;
                        for (let j = 0; j < followers.length; j++) {
                            let follower = followers[j];
                            if (follower === p_username) {
                                followers[j] = c_username;
                                organisations.findOneAndUpdate({ username: org.username }, org, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }
    }
    else if (ac_type == 'l') {
        let code = prev.code;
        let c_email = curr.email;
        let p_full_name = prev.full_name
        let c_full_name = curr.full_name;
        let p_avatar = prev.avatar;
        let c_avatar = curr.avatar;

        general.findOne({ username: code }, (err, ret_g) => {
            if (err) {
                throw err;
            }
            else if (!ret_g) {
                console.log(`Error occured finding the general for legislator. Code: ${code}`);
            }
            else {
                ret_g.email = c_email;

                general.findOneAndUpdate({ username: code }, ret_g, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        });

        comments.find({ sender: code }, (err, ret_cs) => {
            if (err) {
                throw err;
            }
            else if (ret_cs.length > 0 && (p_full_name !== c_full_name || p_avatar !== c_avatar)) {
                for (let i = 0; i < ret_cs.length; i++) {
                    let comment = ret_cs[i];
                    comment.sender_name = c_full_name;
                    comment.sender_avatar = c_avatar;
                    comment.verified = true;

                    comments.findOneAndUpdate({ c_timestamp: comment.c_timestamp }, comment, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        });

        messages.find({ sender: code }, (err, ret_ms) => {
            if (err) {
                throw err;
            }
            else if (ret_ms.length > 0 && (p_full_name !== c_full_name || p_avatar !== c_avatar)) {
                for (let i = 0; i < ret_ms.length; i++) {
                    let message = ret_ms[i];
                    message.sender_name = c_full_name;
                    message.sender_avatar = c_avatar;
                    message.verified = true;

                    messages.findOneAndUpdate({ m_timestamp: message.m_timestamp }, message, (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }
        });

        districts.findOne({ code: code }, (err, ret_d) => {
            if (err) {
                throw err;
            }
            else if (!ret_d) {
                console.log(`Error finding district for Legislator. Code: ${code}`);
            }
            else if (p_full_name !== c_full_name) {
                ret_d.rep = c_full_name;

                districts.findOneAndUpdate({ code: code }, ret_d, (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    }
}

// you need to engage auths.js for all, in fact, in the file before ripple
// auths: username, password_changed{if the user successfully signs in after the fact, negate p_word changed}
module.exports = ripple;