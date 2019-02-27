//module for listing a particular user's dms and listing all
const dms = require('../schemas/dms');
const findUser = require('./findUser');

function list_dms(req, res) {
    findUser(req).then((ret_user) => {
        if (!ret_user) {
            res.send(JSON.stringify({ success: false, reason: "You must be signed in to access this function" }));
        }
        else {
            let username = ret_user.username;
            let avatar = ret_user.avatar;
            if(!username){
                username = ret_user.code;
            }
            if(!avatar){
                avatar = ret_user.logo;
            }

            dms.find({ $or: [{ sender: username }, { recepient: username }] }, (err, ret_dms) => {
                if (err) {
                    res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working on it" }));
                }
                else if (!ret_dms) {
                    res.send(JSON.stringify({ success: true, item: { dms: null } }));
                }
                else {
                    //organise dms;
                    let rec_list = [];
                    for (let i = 0; i < ret_dms.length; i++) {
                        let p_dm = ret_dms[i];
                        let p_sender = p_dm.sender;
                        let p_rec = p_dm.recepient;
        
                        if (p_sender !== username) {
                            if (rec_list.indexOf(p_sender) === -1) {
                                rec_list.push(p_sender);
                            }
                        }
                        if (p_rec !== username) {
                            if (rec_list.indexOf(p_rec) === -1) {
                                rec_list.push(p_rec);
                            }
                        }
                    }
        
                    let recent_msgs = [];
                    for (let i = 0; i < rec_list.length; i++) {
                        let curr_rec = rec_list[i];
        
                        for (let j = 0; j < ret_dms.length; j++) {
                            let curr_dm = ret_dms[j];
                            if (curr_dm.sender === curr_rec || curr_dm.recepient === curr_rec) {
                                let curr_msg = recent_msgs[i];
                                if (curr_msg) {
                                    if (curr_msg.timestamp < curr_dm.timestamp) {
                                        recent_msgs[i] = curr_dm;
                                    }
                                }
                                else {
                                    recent_msgs[i] = curr_dm;
                                }
                            }
                        }
                    }

                    let final_msgs = [];
                    for(let i=0; i<recent_msgs.length; i++){
                        let curr_msg = recent_msgs[i];
                        let m_item = {
                            message: curr_msg
                        }
                        if(curr_msg.sender === username){
                            m_item.act_name = curr_msg.recepient_name;
                            m_item.act_avatar = curr_msg.recepient_avatar;
                            m_item.c_username = curr_msg.recepient;
                        }
                        else {
                            m_item.act_name = curr_msg.sender_name;
                            m_item.act_avatar = curr_msg.sender_avatar;
                            m_item.c_username = curr_msg.sender;
                        }
                        final_msgs.push(m_item);
                    }
        
                    res.send(JSON.stringify({ success: true, item: { conversations: final_msgs, username: username } }));
                }
            });
        }
    }).catch(ret_e => {
        res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working on it" }));
        console.log(ret_e);
    });
}

module.exports = list_dms;