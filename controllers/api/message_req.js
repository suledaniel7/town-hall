const messages = require('../schemas/messages');
const comments = require('../schemas/comments');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
const findActive = require('./findActive');

function msgReq(req, res){
    let timestamp = req.params.timestamp;
    let m_type = req.params.m_type;
    let u_type = findActive(req, res);

    if(u_type == 'user'){
        if(req.user){
            if(req.user.user){
                let username = req.user.user.username;
                users.findOne({username: username}, (err, ret_u)=>{
                    if(err){
                        throw err;
                    }
                    else if(!ret_u){
                        res.send({success: false, reason: "Invalid Account"});
                    }
                    else {
                        retrieveMessage(username);
                    }
                });
            }
            else {
                res.send({success: false, reason: "Invalid Credentials"});
            }
        }
        else {
            res.send({success: false, reason: "Invalid Credentials"});
        }
    }
    else if(u_type == 'organisation'){
        if(req.organisation){
            if(req.organisation.user){
                let username = req.organisation.user.username;
                organisations.findOne({username: username}, (err, ret_u)=>{
                    if(err){
                        throw err;
                    }
                    else if(!ret_u){
                        res.send({success: false, reason: "Invalid Account"});
                    }
                    else {
                        retrieveMessage(username);
                    }
                });
            }
            else {
                res.send({success: false, reason: "Invalid Credentials"});
            }
        }
        else {
            res.send({success: false, reason: "Invalid Credentials"});
        }
    }
    else if(u_type == 'journalist'){
        if(req.journalist){
            if(req.journalist.user){
                let username = req.journalist.user.username;
                journalists.findOne({username: username}, (err, ret_u)=>{
                    if(err){
                        throw err;
                    }
                    else if(!ret_u){
                        res.send({success: false, reason: "Invalid Account"});
                    }
                    else {
                        retrieveMessage(username);
                    }
                });
            }
            else {
                res.send({success: false, reason: "Invalid Credentials"});
            }
        }
        else {
            res.send({success: false, reason: "Invalid Credentials"});
        }
    }
    else if(u_type == 'legislator'){
        if(req.legislator){
            if(req.legislator.user){
                let email = req.legislator.user.email;
                legislators.findOne({email: email}, (err, ret_u)=>{
                    if(err){
                        throw err;
                    }
                    else if(!ret_u){
                        res.send({success: false, reason: "Invalid Account"});
                    }
                    else {
                        retrieveMessage(email);
                    }
                });
            }
            else {
                res.send({success: false, reason: "Invalid Credentials"});
            }
        }
        else {
            res.send({success: false, reason: "Invalid Credentials"});
        }
    }
    else {
        res.send({success: false, reason: "Invalid User"});
    }

    function retrieveMessage(username){
        if(m_type == 'm'){
            messages.findOne({m_timestamp: timestamp}, (err, ret_m)=>{
                if(err){
                    throw err;
                }
                else if(!ret_m){
                    res.send({success: false, reason: "Invalid Request"});
                }
                else {
                    h_msg = extractTags([ret_m], username);
                    let item = {
                        message: extractMentions(h_msg, false)[0]
                    }
                    res.send({success: true, item: item});
                }
            });
        }
        else if(m_type == 'c'){
            comments.findOne({c_timestamp: timestamp}, (err, ret_c)=>{
                if(err){
                    throw err;
                }
                else if(!ret_c){
                    res.send({success: false, reason: "Invalid Request"});
                }
                else {
                    h_cmt = extractTags([ret_c], username);
                    let item = {
                        comment: extractMentions(h_cmt, false)[0]
                    }
                    res.send({success: true, item: item});
                }
            });
        }
        else {
            res.send({success: false, reason: "Invalid Request"});
        }
    }
}

module.exports = msgReq;