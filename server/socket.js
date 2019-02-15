const auths = require('../controllers/schemas/auths');
const generals = require('../controllers/schemas/general');
const acquisition = require('../controllers/api/acquire_audience');
const districts = require('../controllers/schemas/districts');
const messages = require('../controllers/schemas/messages');
const journalists = require('../controllers/schemas/journalists');
const organisations = require('../controllers/schemas/organisations');
const findUserWithUsername = require('../controllers/api/findUserWithUsername');
const recompile_feed = require('../controllers/api/recompile_feed');

function socketFn(event, data) {
    if (event === 'save_auth') {
        return new Promise((resolve, reject) => {
            let ip = data;
            auths.findOne({ ip: ip }, (err, ret_a) => {
                if (err) {
                    reject(err);
                }
                else if (!ret_a) {
                    resolve(null);
                }
                else {
                    resolve(ret_a.username);
                }
            });
        });
    }
    else if (event === 'message_sent') {
        return new Promise((resolve, reject) => {
            let username = data.username;
            let timestamp = data.timestamp;
            let beats = data.beats;

            if (!username) {
                let pos = timestamp.indexOf('-');
                username = timestamp.slice(0, pos);
            }

            messages.findOne({ m_timestamp: timestamp }, (err, ret_m) => {
                if (err) {
                    reject(err);
                }
                else if (ret_m) {
                    acquisition(username, beats).then((audience) => {
                        resolve({ audience: audience, message: ret_m, username: username });
                    }).catch(err => {
                        reject("An error occured during acquistion. Socket.js in server. Error: " + err);
                    });
                }
            });
        });
    }
    else if (event === 'j_request') {
        return new Promise((resolve, reject) => {
            let j_username = data.j_username;
            let o_username = data.o_username;

            organisations.findOne({ username: o_username }, (err, ret_o) => {
                if (err) {
                    reject(err);
                }
                else if (!ret_o) {
                    resolve({ found: false });
                }
                else {
                    let p_reqs = ret_o.pending_reqs;
                    let index = -1;
                    for (let i = 0; i < p_reqs.length; i++) {
                        let req = p_reqs[i];
                        if (req.username === j_username) {
                            index = i;
                        }
                    }

                    if (index === -1) {
                        resolve({ found: false });
                    }
                    else {
                        journalists.findOne({ username: j_username }, (err, ret_j) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!ret_j) {
                                resolve({ found: false });
                            }
                            else {
                                resolve({ found: true, journo: ret_j });
                            }
                        });
                    }
                }
            });
        });
    }
    else if (event === 'accept_j') {
        return new Promise((resolve, reject) => {
            let o_username = data.o_username;
            let j_username = data.j_username;

            organisations.findOne({ username: o_username }, (err, ret_o) => {
                if (err) {
                    reject(err);
                }
                else if (!ret_o) {
                    resolve({ found: false });
                }
                else {
                    let o_js = ret_o.journalists;
                    let j_index = -1;
                    for (let i = 0; i < o_js.length; i++) {
                        if (o_js[i].username === j_username) {
                            j_index = i;
                        }
                    }

                    if (j_index === -1) {
                        resolve({ found: false });
                    }
                    else {
                        journalists.findOne({ username: j_username }, (err, ret_j) => {
                            if (err) {
                                reject(err);
                            }
                            else if (!ret_j) {
                                resolve({ found: false });
                            }
                            else {
                                let beat = ret_j.beat;
                                districts.findOne({ code: beat }, (err, ret_d) => {
                                    if (err) {
                                        reject(err);
                                    }
                                    else if (!ret_d) {
                                        resolve({ found: false });
                                    }
                                    else {
                                        if (ret_d.type === 'sen') {
                                            ret_d.type = "Sen. ";
                                        }
                                        else {
                                            ret_d.type = "Rep. ";
                                        }
                                        ret_j.beatDets = ret_d;

                                        resolve({ found: true, journo: ret_j });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });
    }
    else if (event === 'changed_profile') {
        return new Promise((resolve, reject) => {
            let username = data.username;
            generals.findOne({ username: username }, (err, ret_g) => {
                if (err) {
                    reject(err);
                }
                else if (!ret_g) {
                    resolve({ found: false });
                }
                else {
                    let identifier = ret_g.identifier;
                    findUserWithUsername(identifier, username).then((user) => {
                        resolve(user);
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        });
    }
    else if (event === 'assign_j') {
        return new Promise((resolve, reject) => {
            let username = data;
            if (username) {
                journalists.findOne({ username: username }, (err, ret_j) => {
                    if (err) {
                        reject(err);
                    }
                    else if (!ret_j) {
                        resolve(null);
                    }
                    else {
                        resolve(ret_j.beatDets);
                    }
                });
            }
        });
    }
    else if (event === 'follow') {
        return new Promise((resolve, reject) => {
            let ip = data.ip;
            auths.findOne({ ip: ip }, (err, ret_a) => {
                if (err) {
                    reject(err);
                }
                else if (!ret_a) {
                    resolve(null);
                }
                else {
                    let username = ret_a.username;

                    recompile_feed(username).then((msgs) => {
                        if (!msgs) {
                            reject("Invalid request");
                        }
                        else {
                            resolve({ msgs: msgs, username: username });
                        }
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        });
    }
    else if (event === 'edit') {
        return new Promise((resolve, reject) => {
            let username = data.username;
            let timestamp = data.timestamp;
            let beats = data.beats;

            if (!username) {
                let pos = timestamp.indexOf('-');
                username = timestamp.slice(0, pos);
            }

            messages.findOne({ m_timestamp: timestamp }, (err, ret_m) => {
                if (err) {
                    reject(err);
                }
                else if (ret_m) {
                    acquisition(username, beats).then((audience) => {
                        resolve({ audience: audience, message: ret_m, username: username });
                    }).catch(err => {
                        reject("An error occured during acquistion for edits. Socket.js in server. Error: " + err);
                    });
                }
            });
        });
    }
    else if (event === 'new_j_post') {
        return new Promise((resolve, reject) => {
            let ip = data;
            auths.findOne({ip: ip}, (err, ret_a)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_a){
                    resolve(null);
                }
                else {
                    let username = ret_a.username;
                    journalists.findOne({username: username}, (err, ret_j)=>{
                        if(err){
                            reject(err);
                        }
                        else if(!ret_j){
                            resolve(null);
                        }
                        else {
                            let org = ret_j.organisation;
                            if(org.length > 0){
                                resolve({username: username, org: org});
                            }
                            else {
                                resolve(null);
                            }
                        }
                    });
                }
            });
        });
    }
    else if(event === 'comment'){
        //dealing w/audience for comm, excl sender cos...
        //comment count for all
        return new Promise((resolve, reject)=>{
            let m_timestamp = data.m_timestamp;
            messages.findOne({m_timestamp: m_timestamp}, (err, ret_m)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_m){
                    resolve(null);
                }
                else {
                    let num = ret_m.comments_no;
                    resolve({m_timestamp: m_timestamp, num: num});
                }
            })
        });
    }
}

module.exports = socketFn;