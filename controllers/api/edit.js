const messages = require('../schemas/messages');
const comments = require('../schemas/comments');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const refineMessage = require('./refineMessage');
const refineComment = require('./refineComment');
const findActive = require('./findActive');
const dateFn = require('./dateFn');
const timeFn = require('./timeFn');

function edit(req, res) {
    let m_type = req.params.m_type;
    let timestamp = req.params.timestamp;
    let m_text = req.body.m_text;

    let u_type = findActive(req, res);
    if (u_type == 'user') {
        let username = req.user.user.username;
        users.findOne({ username: username }, (err, ret_u) => {
            if (err) {
                throw err;
            }
            else if (!ret_u) {
                res.send({success: false, reason: "Invalid Account"});
            }
            else {
                editMessage(username);
            }
        });
    }
    else if (u_type == 'organisation') {
        let username = req.organisation.user.username;
        organisations.findOne({ username: username }, (err, ret_o) => {
            if (err) {
                throw err;
            }
            else if (!ret_o) {
                res.send({success: false, reason: "Invalid Account"});
            }
            else {
                editMessage(username);
            }
        });
    }
    else if (u_type == 'legislator') {
        let code = req.legislator.user.code;
        legislators.findOne({ code: code }, (err, ret_l) => {
            if (err) {
                throw err;
            }
            else if (!ret_l) {
                res.send({success: false, reason: "Invalid Account"});
            }
            else {
                editMessage(code);
            }
        });
    }
    else if (u_type == 'journalist') {
        let username = req.journalist.user.username;
        journalists.findOne({ username: username }, (err, ret_j) => {
            if (err) {
                throw err;
            }
            else if (!ret_j) {
                res.send({success: false, reason: "Invalid Account"});
            }
            else {
                editMessage(username);
            }
        });
    }
    else {
        res.sendStatus(403);
    }

    function editMessage(username) {
        if (m_type == 'message') {
            //message
            messages.findOne({ m_timestamp: timestamp }, (err, ret_m) => {
                if (err) {
                    throw err;
                }
                else if (!ret_m) {
                    res.send({success: false, reason: "Invalid Account"});
                }
                else if (ret_m.sender != username) {
                    res.send({success: false, reason: "Access Denied"});
                }
                else {
                    let beats = ret_m.beats;
                    let m_type = ret_m.ac_type;
                    if(ret_m.ac_type == 'o'){
                        beats = req.body.recepients;
                    }
                    else if(ret_m.ac_type == 'j'){
                        m_type = req.body.post_type;
                    }
                    let m_obj = refineMessage(m_text, timestamp);
                    if (m_obj) {
                        m_text = m_obj.message;
                        let mentions = m_obj.mentions;
                        let tags = m_obj.tags;

                        let newMessage = {
                            sender: ret_m.sender,
                            sender_name: ret_m.sender_name,
                            sender_position: ret_m.sender_position,
                            sender_avatar: ret_m.sender_avatar,
                            beats: beats,
                            verified: ret_m.verified,
                            message: m_text,
                            ac_type: ret_m.ac_type,
                            comments_no: ret_m.comments_no,
                            timestamp: ret_m.timestamp,
                            m_timestamp: ret_m.m_timestamp,
                            tags: tags,
                            mentions: mentions,
                            date_created: dateFn(new Date(), true),
                            time_created: timeFn(new Date())
                        }

                        if(m_type){
                            newMessage.m_type = m_type;
                        }

                        messages.findOneAndUpdate({ m_timestamp: timestamp }, newMessage, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                res.send(JSON.stringify({
                                    success: true
                                }));
                            }
                        });
                    }
                }
            });
        }
        else if (m_type == 'comment') {
            comments.findOne({ c_timestamp: timestamp }, (err, ret_c) => {
                if (err) {
                    throw err;
                }
                else if (!ret_c) {
                    res.send({success: false, reason: "Invalid Account"});
                }
                else if (ret_c.sender != username) {
                    res.send({success: false, reason: "Access Denied"});
                }
                else {
                    let c_obj = refineComment(m_text);
                    if (c_obj) {
                        let c_text = c_obj.comment;
                        let tags = c_obj.tags;

                        let newComment = {
                            comment: c_text,
                            sender: ret_c.sender,
                            sender_name: ret_c.sender_name,
                            sender_avatar: ret_c.sender_avatar,
                            verified: ret_c.verified,
                            isUser: ret_c.isUser,
                            timestamp: ret_c.timestamp,
                            m_timestamp: ret_c.m_timestamp,
                            c_timestamp: ret_c.c_timestamp,
                            c_type: ret_c.c_type,
                            comments_no: ret_c.comments_no,
                            tags: tags,
                            date_created: dateFn(new Date(), true),
                            time_created: timeFn(new Date())
                        }

                        comments.findOneAndUpdate({c_timestamp: timestamp}, newComment, (err)=>{
                            if(err){
                                throw err;
                            }
                            else {
                                res.send(JSON.stringify({
                                    success: true
                                }));
                            }
                        });
                    }
                }
            });
        }
        else {
            res.sendStatus(403);
        }
    }
}

module.exports = edit;