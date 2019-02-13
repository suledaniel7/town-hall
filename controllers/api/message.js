const messages = require('../schemas/messages');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const saveTags = require('./save_tags');
const extractMentions = require('./extractMentions');
const dateFn = require('./dateFn');
const timeFn = require('./timeFn');

function messageHandler(req, res) {
    let m_type = req.params.type;
    let mText = req.body.mBody;
    let today = new Date();
    let comments_no = 0;
    let timestamp = today.getTime();
    let wsp = /^\s*$/;

    if (!wsp.test(mText)) {
        //message not-empty. Clear trailing and leading whitespace
        let tsp = /\s+$/;
        let lsp = /^\s+/;

        if (tsp.test(mText)) {
            mText = mText.replace(tsp, '');
        }
        if (lsp.test(mText)) {
            mText = mText.replace(lsp, '');
        }
        //extract tags
        let tags = [];
        let unRefTags = [];
        let mTextArr = mText.split(/\s/);
        //extract based on hashes
        mTextArr.forEach(element => {
            if (element[0] == '#' && element.slice(1).search(/\W/) != 0) {
                unRefTags.push(element);
            }
        });
        //extract invalid characters
        unRefTags.forEach(tag => {
            let partTag = tag.slice(1);
            let end = partTag.search(/\W/);
            if (end == -1) {
                tags.push(partTag.toLowerCase());
            }
            else {
                let fin_tag = partTag.slice(0, end);
                tags.push(fin_tag.toLowerCase());
            }
        });

        //extract mentions
        let mentions = extractMentions([{ message: mText }], true).m_arr;

        //create message
        //find type
        if (m_type == 'j') {
            //journo
            if (!req.journalist) {
                res.send({success: false, reason: "Invalid Journalist Account"});
            }
            else if (!req.journalist.user) {
                res.send({success: false, reason: "Invalid Journalist Account"});
            }
            else {
                let username = req.journalist.user.username;
                let post_type = req.body.post_type;
                let isNews = false;
                if(!post_type){
                    post_type = 'o';
                }
                if(post_type === 'n'){
                    isNews = true;
                }

                let message = new messages({
                    sender: username,
                    message: mText,
                    ac_type: m_type,
                    comments_no: comments_no,
                    timestamp: timestamp,
                    m_timestamp: username + '-' + timestamp,
                    tags: tags,
                    mentions: mentions,
                    m_type: post_type,
                    isNews: isNews,
                    date_created: dateFn(new Date(), true),
                    time_created: timeFn(new Date())
                });

                saveTags(tags, username + '-' + timestamp);
                let nonEmpty = /^.+$/;//pretty loose here

                journalists.findOne({ username: username, beat: nonEmpty }, (err, ret_j) => {
                    if (err) {
                        throw err;
                    }
                    else if (!ret_j) {
                        res.send({success: false, reason: "Invalid Credentials"});
                    }
                    else {
                        //j exists, send message finally
                        ret_j.messages_no++;
                        journalists.findOneAndUpdate({ username: username }, ret_j, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                message.verified = ret_j.verified;
                                message.sender_name = ret_j.f_name + ' ' + ret_j.l_name;
                                if (ret_j.account.type == 'formal') {
                                    message.sender_position = ret_j.orgName + ' Journalist';
                                }
                                else {
                                    message.sender_position = "Freelance Journalist";
                                }
                                message.sender_avatar = ret_j.avatar;
                                message.beats = [ret_j.beat];
                                message.save((err) => {
                                    if (err) {
                                        res.send({success: false, reason: "An error occured in saving your message. Please try again later"});
                                    }
                                    else {
                                        res.send({success: true, username: `${username}`, timestamp: `${username}-${timestamp}`, beats: message.beats});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        else if (m_type == 'o') {
            let beats = req.body.recepients;
            let post_type = req.body.post_type;
            let isNews = false;
            if(!post_type){
                post_type = 'o';
            }
            if(post_type === 'n'){
                isNews = true;
            }
            if (!req.organisation) {
                res.send({success: false, reason: "Invalid Credentials"});
            }
            else if (!req.organisation.user) {
                res.send({success: false, reason: "Invalid Credentials"});
            }
            else {
                //user exists
                let username = req.organisation.user.username;
                let message = new messages({
                    sender: username,
                    message: mText,
                    ac_type: m_type,
                    m_type: post_type,
                    isNews: isNews,
                    comments_no: comments_no,
                    timestamp: timestamp,
                    m_timestamp: username + '-' + timestamp,
                    tags: tags,
                    mentions: mentions,
                    date_created: dateFn(new Date(), true),
                    time_created: timeFn(new Date())
                });

                saveTags(tags, username + '-' + timestamp);

                organisations.findOne({ username: username }, (err, ret_o) => {
                    if (err) {
                        throw err;
                    }
                    else if (!ret_o) {
                        res.send({success: false, reason: "Invalid Organisation Account"});
                    }
                    else {
                        //org exists
                        ret_o.messages_no++;
                        organisations.findOneAndUpdate({ username: username }, ret_o, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                message.verified = ret_o.verification.verified;
                                message.sender_name = ret_o.name;
                                message.sender_position = "Media Organisation";
                                message.sender_avatar = ret_o.logo;

                                if (beats[0] == 'all') {
                                    //normal
                                    message.beats = 'all';
                                    message.save((err) => {
                                        if (err) {
                                            res.send({success: false, reason: "An error occured in saving your message. Please try again later"});
                                        }
                                        else {
                                            res.send({success: true, username: username, timestamp: `${username}-${timestamp}`, beats: message.beats});
                                        }
                                    });
                                }
                                else {
                                    message.beats = beats;
                                    message.save((err) => {
                                        if (err) {
                                            res.send({success: false, reason: "An error occured in saving your message. Please try again later"});
                                        }
                                        else {
                                            res.send({success: true, username: username, timestamp: `${username}-${timestamp}`, beats: message.beats});
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
        else if (m_type == 'l') {
            if (!req.legislator) {
                res.send({success: false, reason: "Invalid Credentials"});
            }
            else if (!req.legislator.user) {
                res.send({success: false, reason: "Invalid Credentials"});
            }
            else {
                //user exists
                //compile message
                let email = req.legislator.user.email;
                let code = req.legislator.user.code;
                let message = new messages({
                    sender: code,
                    message: mText,
                    ac_type: m_type,
                    m_type: 'n',
                    isNews: true,
                    comments_no: comments_no,
                    timestamp: timestamp,
                    m_timestamp: code + '-' + timestamp,
                    tags: tags,
                    mentions: mentions,
                    date_created: dateFn(new Date(), true),
                    time_created: timeFn(new Date())
                });

                saveTags(tags, code + '-' + timestamp);

                legislators.findOne({ email: email }, (err, ret_l) => {
                    if (err) {
                        throw err;
                    }
                    else if (!ret_l) {
                        res.send({success: false, reason: "Invalid Legislator Account"});
                    }
                    else {
                        //leg exists
                        ret_l.messages_no++;
                        legislators.findOneAndUpdate({ email: email }, ret_l, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                message.verified = true;
                                message.beats = [ret_l.code];
                                message.sender_name = ret_l.type_exp + ' ' + ret_l.full_name;
                                message.sender_position = 'Representative of ' + ret_l.district + ' | ' + ret_l.state + ' State';
                                message.sender_avatar = ret_l.avatar;
                                message.save((err) => {
                                    if (err) {
                                        res.send({success: false, reason: "An error occured in saving your message. Please try again later"});
                                    }
                                    else {
                                        res.send({success: true, username: code, timestamp: `${code}-${timestamp}`, beats: message.beats});
                                    }
                                });
                            }
                        })
                    }
                });
            }
        }
        else {
            res.sendStatus(403);
        }
    }
}

module.exports = messageHandler;