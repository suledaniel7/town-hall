const assignBeat = require('./org-assign-beat-render');
const orgSchema = require('../schemas/organisations');
const districts = require('../schemas/districts');
const journalists = require('../schemas/journalists');
const messages = require('../schemas/messages');
// const extractTags = require('./extractTags');
// const extractMentions = require('./extractMentions');
const log_entry = require('./log_entry');

function profileRender(req, res) {
    let start_time = new Date();
    let init_user = req.organisation.user;
    let username = init_user.username;
    let item = {};
    item.u_type = 'o';
    let page = req.query.pg;

    orgSchema.findOne({ username: username }, (err, user) => {
        if (err) {
            throw err;
        }
        else {
            if (!user) {
                res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
            }
            else {
                item.user = user;
                if (page == 'home') {
                    //only journo messages
                    journalists.find({ organisation: username, beat: /^[^\s$]/ }, (err, journos) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            let j_list = [];
                            journos.forEach(journo => {
                                j_list.push({
                                    sender: journo.username
                                });
                            });

                            if (j_list.length > 0) {
                                messages.find({ $or: j_list }).sort({ timestamp: -1 }).exec((err, ret_jMsgs) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        // let tmpJMsgs = extractTags(ret_jMsgs, null);
                                        // item.j_msgs = extractMentions(tmpJMsgs);
                                        item.j_msgs = ret_jMsgs;

                                        res.send(JSON.stringify({ success: true, item: item }));
                                        let end_time = new Date();
                                        log_entry("Render Mobile Organisation profile", false, start_time, end_time);
                                    }
                                });
                            }
                            else {
                                item.j_msgs = [];
                                res.send(JSON.stringify({ success: true, item: item }));
                                let end_time = new Date();
                                log_entry("Render Mobile Organisation profile", false, start_time, end_time);
                            }
                        }
                    });
                }
                else if (page == 'journos') {
                    if(user.pending_reqs.length > 0){
                        item.pending_reqs = true;
                    }
                    //journo info
                    journalists.find({ organisation: username, beat: /^[^\s$]/ }).sort({l_name: 1}).exec((err, journos) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            let obtain_dists = (o_js) => {
                                return new Promise((resolve, reject) => {
                                    let final = o_js.length - 1;
                                    for (let i = 0; i < o_js.length; i++) {
                                        districts.findOne({ code: o_js[i].beat }, (err, ret_d) => {
                                            if (err) {
                                                throw err;
                                            }
                                            else if (!ret_d) {
                                                reject("Invalid District");
                                            }
                                            else {
                                                if(ret_d.type === 'sen'){
                                                    ret_d.type = "Sen. ";
                                                }
                                                else {
                                                    ret_d.type = "Rep. ";
                                                }
                                                o_js[i].beatDets = ret_d;
                                                if (final === -1 || i === final) {
                                                    resolve(o_js);
                                                }
                                            }
                                        });
                                    }
                                    if(o_js.length === 0){
                                        resolve(null);
                                    }
                                });
                            }
                            obtain_dists(journos).then((ret_journos) => {
                                item.journos = ret_journos;
                                res.send(JSON.stringify({ success: true, item: item }));
                                let end_time = new Date();
                                log_entry("Render Mobile Organisation profile", false, start_time, end_time);
                            }).catch((reason)=>{
                                res.send(JSON.stringify({success: false, reason: "An error occured in obtaining the districts for your Journalists"}));
                                let end_time = new Date();
                                log_entry("Render Mobile Organisation profile", false, start_time, end_time);
                            });
                        }
                    });
                }
                else if (page == 'profile') {
                    //profile info and org messages
                    messages.find({ sender: username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            // let tmp_msgs = extractTags(ret_msgs, username);
                            // item.messages = extractMentions(tmp_msgs);
                            item.messages = ret_msgs;
                            res.send(JSON.stringify({ success: true, item: item }));
                            let end_time = new Date();
                            log_entry("Render Mobile Organisation profile", false, start_time, end_time);
                        }
                    });
                }
                else if (page == 'compose') {
                    //district info
                    districts.find((err, ret_ds) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            let st_arr = [];
                            let b_arr = [];
                            ret_ds.forEach(ret_d => {
                                let input_index = st_arr.length;
                                for (let i = 0; i < st_arr.length; i++) {
                                    let st = st_arr[i];
                                    if (st.name == ret_d.state) {
                                        input_index = i;
                                    }
                                }
                                let d_type = "Fed Const.";
                                if (ret_d.type == 'sen') {
                                    d_type = "Sen Dist."
                                }
                                if (st_arr[input_index]) {
                                    st_arr[input_index].districts.push({ name: ret_d.name, code: ret_d.code, d_type: d_type });
                                }
                                else {
                                    st_arr[input_index] = {
                                        name: ret_d.state,
                                        districts: [{ name: ret_d.name, code: ret_d.code, d_type: d_type }]
                                    }
                                }
                                b_arr.push({
                                    name: ret_d.name,
                                    code: ret_d.code,
                                    type: d_type
                                });
                            });

                            item.beats = st_arr;
                            item.b_arr = b_arr;
                            item.avatar = user.logo;
                            res.send(JSON.stringify({ success: true, item: item }));
                            let end_time = new Date();
                            log_entry("Render Mobile Organisation profile", false, start_time, end_time);
                        }
                    });
                }
                else if(page === 'root'){
                    if (user.pendingBeat.status) {
                        let j_username = user.pendingBeat.username;
                        journalists.findOne({username: j_username}, (err, ret_j)=>{
                            if(err){
                                throw err;
                            }
                            else if(!ret_j){
                                //send error, remove pending beat, at ts, reload
                                user.pendingBeat = {
                                    status: false,
                                    username: ""
                                }
                                for(let i=0; i<user.pending_reqs.length; i++){
                                    let p_req = user.pending_reqs[i];
                                    if(p_req.username === j_username){
                                        user.pending_reqs.splice(i, 1);
                                    }
                                }
                                orgSchema.findOneAndUpdate({username: username}, user, (err)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        res.send(JSON.stringify({success : true, pending: false}));
                                    }
                                });
                            }
                            else {
                                ret_j.password = null;
                                res.send(JSON.stringify({success: true, pending: true, journo: ret_j, user: user}));
                            }
                        });
                    }
                    else {
                        res.send(JSON.stringify({success: true, pending: false}));
                    }
                }
            }
        }
    });
}

module.exports = profileRender;