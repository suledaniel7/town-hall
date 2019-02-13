const auths = require('../controllers/schemas/auths');
const generals = require('../controllers/schemas/general');
const acquisition = require('../controllers/api/acquire_audience');
const districts = require('../controllers/schemas/districts');
const messages = require('../controllers/schemas/messages');
// const users = require('../controllers/schemas/users');
const journalists = require('../controllers/schemas/journalists');
// const legislators = require('../controllers/schemas/legislators');
const organisations = require('../controllers/schemas/organisations');
const findUserWithUsername = require('../controllers/api/findUserWithUsername');

function socketFn(event, data) {
    if(event === 'save_auth'){
        return new Promise((resolve, reject)=>{
            let ip = data;
            auths.findOne({ip: ip}, (err, ret_a)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_a){
                    resolve(null);
                }
                else {
                    resolve(ret_a.username);
                }
            });
        });
    }
    else if(event === 'message_sent') {
        return new Promise((resolve, reject)=>{
            let username = data.username;
            let timestamp = data.timestamp;
            let beats = data.beats;

            if(!username){
                let pos = timestamp.indexOf('-');
                username = timestamp.slice(0, pos);
            }
    
            messages.findOne({ m_timestamp: timestamp }, (err, ret_m) => {
                if (err) {
                    reject(err);
                }
                else if (ret_m) {
                    acquisition(username, beats).then((audience) => {
                        resolve({audience: audience, message: ret_m, username: username});
                    }).catch(err => {
                        reject("An error occured during acquistion. Socket.js in server. Error: " + err);
                    });
                }
            });
        });
    }
    else if(event === 'j_request'){
        return new Promise((resolve, reject)=>{
            let j_username = data.j_username;
            let o_username = data.o_username;

            organisations.findOne({username: o_username}, (err, ret_o)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_o){
                    resolve({found: false});
                }
                else {
                    let p_reqs = ret_o.pending_reqs;
                    let index = -1;
                    for(let i=0; i<p_reqs.length; i++){
                        let req = p_reqs[i];
                        if(req.username === j_username){
                            index = i;
                        }
                    }

                    if(index === -1){
                        resolve({found: false});
                    }
                    else {
                        journalists.findOne({username: j_username}, (err, ret_j)=>{
                            if(err){
                                reject(err);
                            }
                            else if(!ret_j){
                                resolve({found: false});
                            }
                            else {
                                resolve({found: true, journo: ret_j});
                            }
                        });
                    }
                }
            });
        });
    }
    else if(event === 'accept_j'){
        return new Promise((resolve, reject)=>{
            let o_username = data.o_username;
            let j_username = data.j_username;
    
            organisations.findOne({username: o_username}, (err, ret_o)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_o){
                    resolve({found: false});
                }
                else {
                    let o_js = ret_o.journalists;
                    let j_index = -1;
                    for(let i=0; i<o_js.length; i++){
                        if(o_js[i].username === j_username){
                            j_index = i;
                        }
                    }
    
                    if(j_index === -1){
                        resolve({found: false});
                    }
                    else {
                        journalists.findOne({username: j_username}, (err, ret_j)=>{
                            if(err){
                                reject(err);
                            }
                            else if(!ret_j){
                                resolve({found: false});
                            }
                            else {
                                let beat = ret_j.beat;
                                districts.findOne({code: beat}, (err, ret_d)=>{
                                    if(err){
                                        reject(err);
                                    }
                                    else if(!ret_d){
                                        resolve({found: false});
                                    }
                                    else {
                                        if(ret_d.type === 'sen'){
                                            ret_d.type = "Sen. ";
                                        }
                                        else {
                                            ret_d.type = "Rep. ";
                                        }
                                        ret_j.beatDets = ret_d;

                                        resolve({found: true, journo: ret_j});
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });
    }
    else if(event === 'changed_profile'){
        return new Promise((resolve, reject)=>{
            let username = data.username;
            generals.findOne({username: username}, (err, ret_g)=>{
                if(err){
                    reject(err);
                }
                else if(!ret_g){
                    resolve({found: false});
                }
                else {
                    let identifier = ret_g.identifier;
                    findUserWithUsername(identifier, username).then((user)=>{
                        resolve(user);
                    }).catch(err =>{
                        reject(err);
                    });
                }
            });
        });
    }
    else if(event === 'assign_j'){
        return new Promise((resolve, reject)=>{
            let username = data;
            if(username){
                journalists.findOne({username: username}, (err, ret_j)=>{
                    if(err){
                        reject(err);
                    }
                    else if(!ret_j){
                        resolve(null);
                    }
                    else {
                        resolve(ret_j.beatDets);
                    }
                });
            }
        });
    }
}

module.exports = socketFn;