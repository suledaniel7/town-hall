const organisations = require('./schemas/organisations');
const journalists = require('./schemas/journalists');
const messages = require('./schemas/messages');

function removeJ(req, res) {
    let j_username = req.params.username;
    let o_username = req.organisation.user.username;

    if (!o_username || !j_username) {
        res.sendStatus(403);
    }
    else {
        organisations.findOne({ username: o_username }, (err, ret_o) => {
            if (err) {
                throw err;
            }
            else if (!ret_o) {
                res.sendStatus(403);
            }
            else {
                journalists.findOne({ username: j_username }, (err, ret_j) => {
                    if (err) {
                        throw err;
                    }
                    else if (!ret_j) {
                        res.sendStatus(403);
                    }
                    else {
                        let org_js = ret_o.journalists;
                        let found = false;
                        let foundIndex = -1;
                        for (let i = 0; i < org_js.length; i++) {
                            let org_j = org_js[i];
                            if (org_j.username === j_username) {
                                found = true;
                                foundIndex = i;
                            }
                        }

                        if (found) {
                            ret_o.journo_num--;

                            ret_o.journalists.splice(foundIndex, 1);

                            let covered_dists = [];

                            for (let i = 0; i < org_js.length; i++) {
                                let beat = org_js[i].beat;
                                if (covered_dists.indexOf(beat) === -1) {
                                    covered_dists.push(beat);
                                }
                            }

                            ret_o.districts = covered_dists;

                            ret_j.verified = false;
                            ret_j.description = '';
                            ret_j.orgName = '';
                            ret_j.organisation = '';
                            ret_j.beat = '';
                            ret_j.beatName = '';
                            ret_j.account.status = false;
                            ret_j.beatDets = new Object();

                            messages.find({ sender: j_username }, (err, ret_ms) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    for (let i = 0; i < ret_ms.length; i++) {
                                        let message = ret_ms[i];
                                        let d = new Date();

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

                                        messages.findOneAndUpdate({ m_timestamp: message.m_timestamp }, message, (err) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                }
                            })

                            journalists.findOneAndUpdate({ username: j_username }, ret_j, (err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    organisations.findOneAndUpdate({ username: ret_o }, ret_o, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            res.send({ success: true });
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            res.send({ success: false, reason: "Invalid Journalist Selected" });
                        }
                    }
                });
            }
        });
    }
}

module.exports = removeJ;