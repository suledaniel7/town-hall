const legislation = require('../schemas/legislation');
const conversation = require('../schemas/conversation');
const findUser = require('./findUser');
const timeFn = require('./timeFn');
const dateFn = require('./dateFn');

function post_convo(req, res){
    let {l_code, text} = req.body;
    let d = new Date();
    let wsp = /^\s*$/;

    if(wsp.test(l_code) || wsp.test(text)){
        res.send(JSON.stringify({success: false, reason: "No text received"}));
    }
    else{
        legislation.findOne({code: l_code}, (err, ret_l)=>{
            if(err){
                throw err;
            }
            else if(!ret_l){
                res.send(JSON.stringify({success: false, reason: "Invalid Legislation"}));
            }
            else {
                findUser(req).then((user)=>{
                    if(!user){
                        res.send(JSON.stringify({success: false, reason: "You must be signed in to access this feature"}));
                    }
                    else {
                        let username = user.username;
                        if(!username){
                            username = user.code;
                        }
                        let user_name = user.full_name;
                        if(!user_name){
                            user_name = user.name;
                        }
                        if(user.type_exp){
                            user_name = user.type_exp + " " + user_name;
                        }
                        
                        let convo = new conversation({
                            sender: username,
                            sender_name: user_name,
                            sender_position: user.description,
                            sender_avatar: user.avatar,
                            text: text,
                            c_timestamp: `${username}-${d.getTime()}`,
                            timestamp: d.getTime(),
                            date_created: dateFn(d, true),
                            time_created: timeFn(d),
                            l_code: l_code
                        });

                        convo.save((e)=>{
                            if(e){
                                throw e;
                            }
                            else {
                                res.send(JSON.stringify({success: true, convo: convo}));
                            }
                        });
                    }
                }).catch(e=>{
                    console.log(e);
                    res.send(JSON.stringify({success: false, reason: "An error occured on our end. Please try again later"}));
                });
            }
        });
    }
}

module.exports = post_convo;