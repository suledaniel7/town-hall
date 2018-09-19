const assignBeat = require('./org-assign-beat-render');
const orgSchema = require('./schemas/organisations');
const districts = require('./schemas/districts');
const journalists = require('./schemas/journalists');
const messages = require('./schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
const log_entry = require('./log_entry');

function profileRender(req, res) {
    let start_time = new Date();
    let init_user = req.organisation.user;
    let username = init_user.username;
    orgSchema.findOne({ username: username }, (err, user) => {
        if (err) {
            throw err;
        }
        else {
            if (!user) {
                res.redirect('/organisations/signup');
            }
            else if (user.pendingBeat.status) {
                let journo = user.pendingBeat.username;
                assignBeat(req, res, journo);
            }
            else {
                journalists.find({ organisation: username, beat: /^[^\s$]/ }, (err, journos) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        user.journos = journos;

                        //find and compile messages
                        messages.find({ sender: username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                let tmp_msgs = extractTags(ret_msgs, username);
                                user.messages = extractMentions(tmp_msgs);

                                //messages from journos
                                let j_list = [];
                                journos.forEach(journo => {
                                    j_list.push({
                                        sender: journo.username
                                    });
                                });

                                messages.find({ $or: j_list }).sort({ timestamp: -1 }).exec((err, ret_jMsgs) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        let tmpJMsgs = extractTags(ret_jMsgs, null);
                                        user.j_msgs = extractMentions(tmpJMsgs);

                                        res.render('org-profile', user);
                                        let end_time = new Date();
                                        log_entry("Render Organisation profile", false, start_time, end_time);
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

module.exports = profileRender;