const journalists = require('./schemas/journalists');
const legislators = require('./schemas/legislators');
const messages = require('./schemas/messages');
const beatSelect = require('./select-beat-render');
const orgSelect = require('./select-org-render');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
const log_entry = require('./log_entry');
const strip = require('./strip');

function renderProfile(req, res) {
    let start_time = new Date();
    let init_user = req.journalist.user;
    let init_username = init_user.username;

    journalists.findOne({ username: init_username }, (err, journalist) => {
        if (err) {
            throw err;
        }
        else {
            if (!journalist) {
                res.redirect('/journalists');
            }
            else {
                //there are different types of j's: freelance, and formal. Freelance need to choose their beats
                //Formal need to choose the organisations they belong to, well, they send requests
                if (journalist.account.type == 'formal') {
                    if (!journalist.account.status) {
                        //un-organised journo
                        orgSelect(req, res);
                    }
                    else {
                        //organised journo
                        let wsp = /^\s*$/;
                        if (!journalist.verified || wsp.test(journalist.beat)) {
                            journalist.free = false;
                        }
                        else {
                            journalist.free = true;
                        }
                        // Compile messages
                        compileMessages(journalist);
                    }
                }
                else {
                    if (!journalist.account.status) {
                        //un-beat journo
                        beatSelect(req, res);
                    }
                    else {
                        //beat journo
                        journalist.free = true;
                        // Compile messages
                        compileMessages(journalist);
                    }
                }
            }
        }
    });

    function compileMessages(journalist) {
        let code = journalist.beat;
        legislators.findOne({ code: code }, (err, ret_l) => {
            if (err) {
                throw err;
            }
            else if (!ret_l && code) {
                req.journalist.user = null;
                console.log("Error obtaining legislator on j_beat:", code, "journalist:", init_username);
                res.redirect('/');
            }
            else {
                if(ret_l){
                    journalist.rep = strip([ret_l], ['password', 'email', 'likes', 'dislikes']);
                }
                
                messages.find({ sender: init_username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        let tmpMsgs = extractTags(ret_msgs, init_username);
                        journalist.messages = extractMentions(tmpMsgs);
                        let j_beat = journalist.beat;

                        messages.find({ beat: j_beat }).sort({ timestamp: -1 }).exec((err, beat_msgs) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                let tmpBeatMsgs = [];
                                beat_msgs.forEach(beat_msg => {
                                    beat_msg.className = 'beatMsg';
                                    tmpBeatMsgs.push(beat_msg);
                                });
                                tmpBeatMsgs = extractTags(beat_msgs, init_username);
                                journalist.beat_msgs = extractMentions(tmpBeatMsgs);
                                let j_org = journalist.organisation;

                                messages.find({ sender: j_org }).sort({ timestamp: -1 }).exec((err, org_msgs) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        let tmpOrgMsgs = extractTags(org_msgs, null);
                                        journalist.org_msgs = extractMentions(tmpOrgMsgs);

                                        res.render('j-profile', journalist);
                                        let end_time = new Date();
                                        log_entry("Render Journalist profile", false, start_time, end_time);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });


    }
}

module.exports = renderProfile;