const journalists = require('../schemas/journalists');
const legislators = require('../schemas/legislators');
const messages = require('../schemas/messages');
// const extractTags = require('./extractTags');
// const extractMentions = require('./extractMentions');
const log_entry = require('./log_entry');
const strip = require('./strip');

function renderProfile(req, res) {
    let start_time = new Date();
    let init_user = req.journalist.user;
    let init_username = init_user.username;
    let item = {};
    item.u_type = 'j';
    let page = req.query.pg;

    journalists.findOne({ username: init_username }, (err, journalist) => {
        if (err) {
            throw err;
        }
        else {
            if (!journalist) {
                res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
            }
            else {
                //there are different types of j's: freelance, and formal. Freelance need to choose their beats
                //Formal need to choose the organisations they belong to, well, they send requests
                if (journalist.account.type == 'formal') {
                    if (!journalist.account.status) {
                        //un-organised journo
                        if (page == 'verify') {
                            res.send({ complete: false, redirectTo: 'm' });
                        }
                        else {
                            res.send({ success: false, reason: "Apply to an Organisation" });
                        }
                    }
                    else {
                        //organised journo
                        if (page == 'verify') {
                            res.send({ complete: true, redirectTo: 'm' });
                        }
                        else {
                            let wsp = /^\s*$/;
                            if (wsp.test(journalist.beat)) {
                                item.free = false;
                            }
                            else {
                                item.free = true;
                            }
                            // Compile messages
                            compileMessages(journalist);
                        }
                    }
                }
                else {
                    if (!journalist.account.status) {
                        //un-beat journo
                        if (page == 'verify') {
                            res.send({ complete: false, redirectTo: 'l' });
                        }
                        else {
                            res.send({ success: false, reason: "Choose your Beat" });
                        }
                    }
                    else {
                        //beat journo
                        if (page == 'verify') {
                            res.send({ complete: true, redirectTo: 'l' });
                        }
                        else {
                            item.free = true;
                            // Compile messages
                            compileMessages(journalist);
                        }
                    }
                }
            }
        }
    });

    function compileMessages(journalist) {
        let code = journalist.beat;
        let j_org = journalist.organisation;
        let j_beat = journalist.beat;

        legislators.findOne({ code: code }, (err, ret_l) => {
            if (err) {
                throw err;
            }
            else if (!ret_l && code) {
                req.journalist.user = null;
                console.log("Error obtaining legislator on j_beat:", code, "journalist:", init_username);
                res.send(JSON.stringify({ success: false, reason: "An error occured on our side. Please try again later" }));
            }
            else {
                if (ret_l) {
                    item.rep = strip([ret_l], ['password', 'email', 'likes', 'dislikes']);
                }
                item.user = journalist;
                if (page == 'home') {
                    let sources = journalist.sources;
                    let searchSourceArr = [];
                    sources.forEach(source => {
                        searchSourceArr.push({ sender: source });
                    });
                    searchSourceArr.push({beats: j_beat});

                    messages.find({ $or: searchSourceArr }).sort({ timestamp: -1 }).exec((err, beat_msgs) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            let tmpBeatMsgs = [];
                            beat_msgs.forEach(beat_msg => {
                                beat_msg.className = 'beatMsg';
                                tmpBeatMsgs.push(beat_msg);
                            });
                            // tmpBeatMsgs = extractTags(beat_msgs, init_username);
                            // item.beat_msgs = extractMentions(tmpBeatMsgs);
                            item.beat_msgs = beat_msgs;
                            item.user = journalist;

                            res.send(JSON.stringify({ success: true, item: item }));
                            let end_time = new Date();
                            log_entry("Render Journalist profile", false, start_time, end_time);
                        }
                    });
                }
                else if (page == 'org') {
                    messages.find({ sender: j_org }).sort({ timestamp: -1 }).exec((err, org_msgs) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            // let tmpOrgMsgs = extractTags(org_msgs, null);
                            // item.org_msgs = extractMentions(tmpOrgMsgs);
                            item.org_msgs = org_msgs;

                            res.send(JSON.stringify({ success: true, item: item }));
                            let end_time = new Date();
                            log_entry("Render Journalist profile", false, start_time, end_time);
                        }
                    });
                }
                else if (page == 'profile') {
                    messages.find({ sender: init_username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            // let tmpMsgs = extractTags(ret_msgs, init_username);
                            // item.messages = extractMentions(tmpMsgs);
                            item.messages = ret_msgs;
                            item.user = journalist;

                            res.send(JSON.stringify({ success: true, item: item }));
                            let end_time = new Date();
                            log_entry("Render Journalist profile", false, start_time, end_time);
                        }
                    });
                }
                else {
                    res.send(JSON.stringify({ success: false, reason: "Invalid Page Request" }));
                }
            }
        });


    }
}

module.exports = renderProfile;