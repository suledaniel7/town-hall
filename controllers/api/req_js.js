const journalists = require('../schemas/journalists');
const messages = require('../schemas/messages');
const dateFn = require('./dateFn');
const timeFn = require('./timeFn');

function requestJournos(req, res){
    let r_type = req.params.r_type;
    let o_username = req.organisation.user.username;
    let wsp = /^\s*$/;
    let nonEmpty = /^.+$/;//pretty loose here
    if(!wsp.test(o_username)){
        if(r_type === 'usernames'){
            journalists.find({organisation: o_username, beat: nonEmpty}, (err, ret_js)=>{
                if(err){
                    throw err;
                }
                else {
                    let usernames = [];
                    for(let i=0; i<ret_js.length; i++){
                        usernames.push(ret_js[i].username);
                    }

                    res.send(JSON.stringify({success: true, journalists: usernames}));
                }
            });
        }
        else if(r_type === 'messages'){
            let username = req.body.username;
            messages.findOne({sender: username}).sort({timestamp: -1}).limit(1).exec((err, ret_m)=>{
                if(err){
                    throw err;
                }
                else if(!ret_m) {
                    res.send(JSON.stringify({success: true, msg: false}));
                }
                else {
                    let timestamp = ret_m.timestamp;
                    let full_date = new Date(timestamp);

                    let m_time = timeFn(full_date);
                    let m_date = dateFn(full_date, true);

                    res.send(JSON.stringify({success: true, msg: true, time: m_time, date: m_date}));
                }
            })
        }
        else {
            res.send(JSON.stringify({success: false, reason: "Invalid Request Type"}));
        }
    }
    else {
        res.send(JSON.stringify({success: false, reason: "Invalid Parameters"}));
    }
    
}

module.exports = requestJournos;