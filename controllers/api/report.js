const reports = require('../schemas/reports');
const messages = require('../schemas/messages');
const comments = require('../schemas/comments');
const findActive = require('./findActive');

function reportHandler(req, res){
    let m_timestamp = req.params.timestamp;
    let m_type = req.params.m_type;
    let today = new Date();
    let timestamp = today.getTime();

    let u_type = findActive(req, res);
    let username = null;
    if(u_type == 'user'){
        username = req.user.user.username;
    }
    else if(u_type == 'journalist'){
        username = req.journalist.user.username;
    }
    else if(u_type == 'legislator'){
        username = req.legislator.user.username;
    }
    else if(u_type == 'organisation'){
        username = req.organisation.user.username;
    }
    else {
        res.send(JSON.stringify({success: false, reason: "You must be logged in to Report"}));
    }

    if(m_type == 'c'){
        comments.findOne({c_timestamp: m_timestamp}, (err, ret_c)=>{
            if(err){
                throw err;
            }
            else if(!ret_c){
                res.send(JSON.stringify({success: false, reason: "Invalid Comment"}));
            }
            else {
                reportage(ret_c);
            }
        });
    }
    else if(m_type == 'm'){
        messages.findOne({m_timestamp: m_timestamp}, (err, ret_m)=>{
            if(err){
                throw err;
            }
            else if(!ret_m){
                res.send(JSON.stringify({success: false, reason: "Invalid Message"}));
            }
            else {
                reportage(ret_m);
            }
        });
    }
    else {
        res.send(JSON.stringify({success: false}));
    }
    function reportage(message){
        reports.findOne({m_timestamp: m_timestamp}, (err, ret_r)=>{
            if(err){
                throw err;
            }
            else if(!ret_r){
                //report doesn't exist... create
                let new_rep = new reports({
                    r_type: m_type,
                    reported_by: [{r: username, t: timestamp}],
                    m_timestamp: m_timestamp,
                    message_sender: message.sender,
                    timestamp: timestamp,
                    report_count: 1
                });

                new_rep.save((err)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        res.send(JSON.stringify({success: true}));
                    }
                });
            }
            else {
                ret_r.reported_by.push({r: username, t: timestamp});
                ret_r.report_count++;

                reports.findOneAndUpdate({m_timestamp: m_timestamp}, ret_r, (err)=>{
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
}

module.exports = reportHandler;