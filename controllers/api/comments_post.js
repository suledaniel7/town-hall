const comments = require('../schemas/comments');
const messages = require('../schemas/messages');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const findActive = require('./findActive');
const dateFn = require('./dateFn');
const timeFn = require('./timeFn');

function postComment(req, res) {
    let comment = req.body.comment;
    let m_timestamp = req.body.m_timestamp;
    let today = new Date();
    let c_timestamp = today.getTime();
    let c_type = req.body.c_type;
    let u_type = findActive(req, res);

    let u_type_abr = '';
    if(u_type == 'user'){
        u_type_abr = 'u';
    }
    else if(u_type == 'organisation'){
        u_type_abr = 'o';
    }
    else if(u_type == 'journalist'){
        u_type_abr = 'j';
    }
    else if(u_type == 'legislator'){
        u_type_abr = 'l';
    }

    //extract tags
    let tags = [];
    let unRefTags = [];
    let cTextArr = comment.split(/\s/);
    //extract based on hashes
    cTextArr.forEach(element => {
        if(element[0] == '#' && element.slice(1).search(/\W/) != 0){
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

    if (u_type == 'user') {
        let username = req.user.user.username;
        users.findOne({username: username}, (err, ret_u)=>{
            if(err){
                throw err;
            }
            else if(!ret_u){
                res.sendStatus(403);
            }
            else {
                saveMessage(username, ret_u.f_name, ret_u.avatar, false, true);
            }
        });
    }
    else if (u_type == 'organisation') {
        let username = req.organisation.user.username;
        organisations.findOne({username: username}, (err, ret_o)=>{
            if(err){
                throw err;
            }
            else if(!ret_o){
                res.sendStatus(403);
            }
            else {
                saveMessage(username, ret_o.name, ret_o.logo, ret_o.verification.verified, false);
            }
        });
    }
    else if (u_type == 'journalist') {
        let username = req.journalist.user.username;
        journalists.findOne({username: username}, (err, ret_j)=>{
            if(err){
                throw err;
            }
            else if(!ret_j){
                res.sendStatus(403);
            }
            else {
                saveMessage(username, ret_j.full_name, ret_j.avatar, ret_j.verified, false);
            }
        });
    }
    else if (u_type == 'legislator') {
        let code = req.legislator.user.code;
        legislators.findOne({code: code}, (err, ret_l)=>{
            if(err){
                throw err;
            }
            else if(!ret_l){
                res.sendStatus(403);
            }
            else {
                saveMessage(code, ret_l.type_exp + ' ' + ret_l.full_name, ret_l.avatar, true, false);
            }
        });
    }
    else {
        res.sendStatus(403);
    }

    function saveMessage(username, user_name, avatar, verified, isUser) {
        let wsp = /^\s*$/;
        if (!wsp.test(comment) && !wsp.test(m_timestamp)) {
            //they aren't empty
            messages.findOne({ m_timestamp: m_timestamp }, (err, ret_m) => {
                if (err) {
                    throw err;
                }
                else if (ret_m) {
                    let newComment = new comments({
                        comment: comment,
                        sender: username,
                        sender_name: user_name,
                        sender_avatar: avatar,
                        verified: verified,
                        isUser: isUser,
                        timestamp: c_timestamp,
                        m_timestamp: m_timestamp,
                        c_timestamp: `${username}-${c_timestamp}`,
                        c_type: c_type,
                        ac_type: u_type_abr,
                        comments_no: 0,
                        tags: tags,
                        date_created: dateFn(today, true),
                        time_created: timeFn(today)
                    });

                    ret_m.comments_no++;
                    newComment.save((err) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            messages.findOneAndUpdate({ m_timestamp: m_timestamp }, ret_m, (err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    res.send(JSON.stringify({ success: true, comment: newComment, username: username }));
                                }
                            });
                        }
                    });
                }
            });
        }
    }
}

module.exports = postComment;