const messages = require('../schemas/messages');
const comments = require('../schemas/comments');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const findActive = require('./findActive');

function deleteHandler(req, res){
    let m_type = req.params.m_type;
    let timestamp = req.params.timestamp;

    let u_type = findActive(req, res);
    let username = null;
    if(u_type == 'legislator'){
        username = req.legislator.user.code;
    }
    else if(u_type == 'organisation'){
        username = req.organisation.user.username;
    }
    else if(u_type == 'journalist'){
        username = req.journalist.user.username;
    }
    else if(u_type == 'user'){
        username = req.user.user.username;
    }
    
    if(username){
        if(m_type == 'c'){
            comments.findOne({sender: username, c_timestamp: timestamp}, (err, ret_c)=>{
                if(err){
                    throw err;
                }
                else if(!ret_c){
                    res.send(JSON.stringify({success: false, reason: "Invalid Comment"}));
                }
                else {
                    messages.findOne({m_timestamp: ret_c.m_timestamp}, (err, ret_m)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_m){
                            res.send(JSON.stringify({success: false, reason: "Invalid Message"}));
                        }
                        else {
                            ret_m.comments_no--;
                            messages.findOneAndUpdate({m_timestamp: ret_c.m_timestamp}, ret_m, (err)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    comments.findOneAndRemove({c_timestamp: timestamp}, (err)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            res.send(JSON.stringify({success: true, m_timestamp: ret_c.m_timestamp}));
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        else if(m_type == 'm'){
            messages.findOne({sender: username, m_timestamp: timestamp}, (err, ret_m)=>{
                if(err){
                    throw err;
                }
                else if(!ret_m){
                    res.send(JSON.stringify({success: false, reason: "Invalid Message"}));
                }
                else {
                    function removeMessage(){
                        messages.findOneAndRemove({m_timestamp: timestamp}, (err)=>{
                            if(err){
                                throw err;
                            }
                            else {
                                comments.remove({m_timestamp: timestamp}, (err)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        res.send(JSON.stringify({success: true}));
                                    }
                                });
                            }
                        });
                    }
                    if(u_type == 'legislator'){
                        legislators.findOne({code: ret_m.sender}, (err, ret_l)=>{
                            if(err){
                                throw err;
                            }
                            else if(!ret_l){
                                res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                            }
                            else {
                                ret_l.messages_no--;
                                legislators.findOneAndUpdate({code: ret_m.sender}, ret_l, (err)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        removeMessage();
                                    }
                                });
                            }
                        });
                    }
                    else if(u_type == 'organisation'){
                        organisations.findOne({username: ret_m.sender}, (err, ret_o)=>{
                            if(err){
                                throw err;
                            }
                            else if(!ret_o){
                                res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                            }
                            else {
                                ret_o.messages_no--;
                                organisations.findOneAndUpdate({username: ret_m.sender}, ret_o, (err)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        removeMessage();
                                    }
                                });
                            }
                        });
                    }
                    else if(u_type == 'journalist'){
                        journalists.findOne({username: ret_m.sender}, (err, ret_j)=>{
                            if(err){
                                throw err;
                            }
                            else if(!ret_j){
                                res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                            }
                            else {
                                ret_j.messages_no--;
                                journalists.findOneAndUpdate({username: ret_m.sender}, ret_j, (err)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        removeMessage();
                                    }
                                });
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
    else {
        res.sendStatus(403);
    }
}

module.exports = deleteHandler;