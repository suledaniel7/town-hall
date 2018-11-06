const assignBeat = require('./org-assign-beat-render');
const orgSchema = require('../schemas/organisations');
const districts = require('../schemas/districts');
const journalists = require('../schemas/journalists');
const messages = require('../schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
const log_entry = require('./log_entry');

function profileRender(req, res) {
    let start_time = new Date();
    let init_user = req.organisation.user;
    let username = init_user.username;
    orgSchema.findOne({ username: username }, (err, user) => {
        if (err) {
            throw err;
        }
        else {
            if (!user) {
                res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
            }
            else if (user.pendingBeat.status) {
                let journo = user.pendingBeat.username;
                assignBeat(req, res, journo);
            }
            else {
                journalists.find({ organisation: username, beat: /^[^\s$]/ }, (err, journos) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        user.journos = journos;

                        //find and compile messages
                        messages.find({ sender: username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                let tmp_msgs = extractTags(ret_msgs, username);
                                user.messages = extractMentions(tmp_msgs);

                                //messages from journos
                                let j_list = [];
                                journos.forEach(journo => {
                                    j_list.push({
                                        sender: journo.username
                                    });
                                });

                                districts.find((err, ret_ds)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        let st_arr = [];
                                        ret_ds.forEach(ret_d => {
                                            let input_index = st_arr.length;
                                            for(let i=0; i<st_arr.length; i++){
                                                let st = st_arr[i];
                                                if(st.name == ret_d.state){
                                                    input_index = i;
                                                }
                                            }
                                            let d_type = "Fed Const.";
                                            if(ret_d.type == 'sen'){
                                                d_type = "Sen Dist."
                                            }
                                            if(st_arr[input_index]){
                                                st_arr[input_index].districts.push({name: ret_d.name, code: ret_d.code, d_type: d_type});
                                            }
                                            else {
                                                st_arr[input_index] = {
                                                    name: ret_d.state,
                                                    districts: [{name: ret_d.name, code: ret_d.code, d_type: d_type}]
                                                }
                                            }
                                        });
                                        
                                        user.beats = st_arr;
                                        if (j_list.length > 0) {
                                            messages.find({ $or: j_list }).sort({ timestamp: -1 }).exec((err, ret_jMsgs) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    let tmpJMsgs = extractTags(ret_jMsgs, null);
                                                    user.j_msgs = extractMentions(tmpJMsgs);
        
                                                    res.send(JSON.stringify({success: true, item: user}));
                                                    let end_time = new Date();
                                                    log_entry("Render Organisation profile", false, start_time, end_time);
                                                }
                                            });
                                        }
                                        else {
                                            res.send(JSON.stringify({success: true, item: user}));
                                            let end_time = new Date();
                                            log_entry("Render Organisation profile", false, start_time, end_time);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}

module.exports = profileRender;