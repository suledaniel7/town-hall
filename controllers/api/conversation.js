//module for retrieving the dms in a conversation
const dms = require('../schemas/dms');
const findType = require('./findType');
const findUser = require('./findUserWithUsername');

function converse(req, res) {
    let sender = req.body.sender;
    let recepient = req.body.recepient;

    dms.find({ $or: [{ sender: sender, recepient: recepient }, { sender: recepient, recepient: sender }] }).sort({ timestamp: -1 }).exec((err, ret_dms) => {
        if (err) {
            res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working on it" }));
        }
        else if (!ret_dms) {
            res.send(JSON.stringify({ success: true, item: { dms: null } }));
        }
        else {
            findType(sender).then((s_type) => {
                if (!s_type) {
                    res.send(JSON.stringify({ success: false, reason: "Incomplete parameters" }));
                }
                else {
                    findType(recepient).then((r_type) => {
                        if (!r_type) {
                            res.send(JSON.stringify({ success: false, reason: "Incomplete parameters" }));
                        }
                        else {
                            s_type = s_type[0];
                            r_type = r_type[0];

                            findUser(s_type, sender).then((ret_sen)=>{
                                if(!ret_sen){
                                    res.send(JSON.stringify({ success: false, reason: "Invalid data provided" }));
                                }
                                else {
                                    findUser(r_type, recepient).then((ret_rec) => {
                                        if (!ret_rec) {
                                            res.send(JSON.stringify({ success: false, reason: "Invalid data provided" }));
                                        }
                                        else {
                                            let blocked = ret_rec.blocked;
                                            let u_blocked = ret_sen.blocked;
                                            let canSend = true;
                                            let blockedUser = false;
                                            if(blocked){
                                                if(blocked.indexOf(sender) !== -1){
                                                    canSend = false;
                                                }
                                            }
                                            if(u_blocked){
                                                if(u_blocked.indexOf(recepient) !== -1){
                                                    blockedUser = true;
                                                }
                                            }
                                            let r_name = '';
                                            if(ret_rec.f_name){
                                                r_name = ret_rec.f_name;
                                            }
                                            else {
                                                recepient_avatar = ret_rec.name;
                                            }
                
                                            if(ret_rec.l_name){
                                                r_name = r_name + ' ' + ret_rec.l_name;
                                            }
        
                                            res.send(JSON.stringify({ success: true, r_name: r_name, canSend: canSend, blocked: blockedUser, item: { dms: ret_dms } }));
                                        }
                                    }).catch(ret_error => {
                                        res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working on it" }));
                                        console.log(ret_error);
                                    });
                                }
                            }).catch(ret_ser => {
                                res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working on it" }));
                                console.log(ret_ser);
                            });
                        }
                    }).catch(ret_err => {
                        res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working on it" }));
                        console.log(ret_err);
                    });
                }
            }).catch(ret_e => {
                res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working on it" }));
                console.log(ret_e);
            });
        }
    });
}

module.exports = converse;