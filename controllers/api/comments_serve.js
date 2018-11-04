const comments = require('../schemas/comments');
const messages = require('../schemas/messages');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const findActive = require('./findActive');

function serveComments(req, res) {
    let m_timestamp = req.body.m_timestamp;
    let u_type = findActive(req, res);

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
                seekComments(username, ret_u.f_name, ret_u.avatar, false);
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
                seekComments(username, ret_o.name, ret_o.logo, ret_o.verification.verified);
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
                seekComments(username, ret_j.full_name, ret_j.avatar, ret_j.verified);
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
                seekComments(code, ret_l.type_exp + ' ' + ret_l.full_name, ret_l.avatar, true);
            }
        });
    }
    else {
        seekComments(null, null, null, null);
    }

    function seekComments(username, user_name, avatar, verified) {
        messages.findOne({ m_timestamp: m_timestamp }, (err, ret_m) => {
            if (err) {
                throw err;
            }
            else if (ret_m) {
                comments.find({ m_timestamp: m_timestamp }).sort({ timestamp: 1 }).exec((err, ret_cs) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        let user = null;
                        if(username && user_name && avatar){
                            user = {
                                username: username,
                                name: user_name,
                                avatar: avatar,
                                verified: verified
                            }
                        }
                        res.send({ success: true, message: ret_m, comments: ret_cs, user: user, username: username });
                    }
                });
            }
        });
    }

}

module.exports = serveComments;