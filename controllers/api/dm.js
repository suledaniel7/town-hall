//module for creating dms
const dms = require('../schemas/dms');
const findType = require('./findType');
const findUser = require('./findUser');
const obtainRec = require('./findUserWithUsername');
const timeFn = require('./timeFn');
const dateFn = require('./dateFn');

function dm(req, res) {
    let recepient = req.body.recepient;
    let text = req.body.text;
    let d = new Date();

    findUser(req).then((ret_user) => {
        if (!ret_user) {
            res.send(JSON.stringify({ success: false, reason: "You must be logged in to perform this task" }));
        }
        else {
            let username = ret_user.username;
            if (!username) {
                username = ret_user.code;
            }

            findType(recepient).then((r_type) => {
                if (!r_type) {
                    res.send(JSON.stringify({ success: false, reason: "Invalid recepient" }));
                }
                else {
                    r_type = r_type[0];
                    obtainRec(r_type, recepient).then((ret_rec) => {
                        let r_username = ret_rec.username;
                        if (!r_username) {
                            r_username = ret_rec.code;
                        }
                        let blocked = ret_rec.blocked;
                        let canSend = false;
                        if (blocked) {
                            let isBlocked = false;
                            for (let i = 0; i < blocked.length; i++) {
                                if (blocked[i] === username) {
                                    isBlocked = true;
                                }
                            }
                            canSend = !isBlocked;
                        }
                        else {
                            canSend = true;
                        }

                        if (canSend) {
                            //all's well with the world
                            let timestamp = d.getTime();
                            let d_timestamp = `${username}-${timestamp}`;
                            let time_sent = timeFn(d);
                            let date_sent = dateFn(d, true);

                            let sender_name = '';
                            let recepient_name = '';
                            let sender_avatar = '';
                            let recepient_avatar = '';

                            //sender
                            if(ret_user.f_name){
                                sender_name = ret_user.f_name;
                            }
                            else {
                                sender_name = ret_user.name;
                            }

                            if(ret_user.l_name){
                                sender_name = sender_name + ' ' + ret_user.l_name;
                            }

                            if(ret_user.avatar){
                                sender_avatar = ret_user.avatar;
                            }
                            else {
                                sender_avatar = ret_user.logo;
                            }

                            //recepient
                            if(ret_rec.f_name){
                                recepient_name = ret_rec.f_name;
                            }
                            else {
                                recepient_name = ret_rec.name;
                            }

                            if(ret_rec.l_name){
                                recepient_name = recepient_name + ' ' + ret_rec.l_name;
                            }

                            if(ret_rec.avatar){
                                recepient_avatar = ret_rec.avatar;
                            }
                            else {
                                recepient_avatar = ret_rec.logo;
                            }


                            let newDm = new dms({
                                sender: username,
                                sender_name: sender_name,
                                sender_avatar: sender_avatar,
                                recepient: r_username,
                                recepient_name: recepient_name,
                                recepient_avatar: recepient_avatar,
                                timestamp: timestamp,
                                d_timestamp: d_timestamp,
                                text: text,
                                time_sent: time_sent,
                                date_sent: date_sent
                            });

                            newDm.save((err) => {
                                if (err) {
                                    res.send(JSON.stringify({ success: false, reason: "Incomplete message parameters" }));
                                    console.log(err);
                                }
                                else {
                                    res.send({ success: true, dm: newDm });
                                }
                            });
                        }
                        else {
                            res.send(JSON.stringify({ success: false, reason: "You are no longer permitted to send messages to this User" }));
                        }
                    }).catch(err => {
                        res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working to fix it" }));
                        console.log(err);
                    });
                }
            });
        }
    }).catch(ret_e => {
        res.send(JSON.stringify({ success: false, reason: "An error occured on our end. We're working to fix it" }));
        console.log(ret_e);
    });
}

module.exports = dm;