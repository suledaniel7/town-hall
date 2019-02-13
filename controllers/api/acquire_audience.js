const generals = require('../schemas/general');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const legislators = require('../schemas/legislators');
const organisations = require('../schemas/organisations');

function collate(username, beats) {
    return new Promise((resolve, reject) => {
        generals.findOne({ username: username }, (err, ret_g) => {
            if (err) {
                reject(err);
            }
            else if(!ret_g){
                console.log("Problems with general ", username);
            }
            else if (ret_g) {
                let u_type = ret_g.identifier;
                let username = ret_g.username;
                if (u_type === 'j') {
                    //journalists
                    journalists.findOne({ username: username }, (err, ret_j) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!ret_j) {
                            resolve(null);
                        }
                        else {
                            //listeners: users, legislatoR, journalists, organisatioN
                            let audience = [];
                            users.find({$or:[{sources: username}, {sources: ret_j.organisation, $or: [{fed_const: ret_j.beat}, {sen_dist: ret_j.beat}]}]}, (err, ret_us) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    for (let i = 0; i < ret_us.length; i++) {
                                        audience.push({
                                            username: ret_us[i].username,
                                            pg: ['h']
                                        });
                                    }
                                    legislators.findOne({ code: ret_j.beat }, (err, ret_l) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        else if (!ret_l) {
                                            resolve(null);
                                        }
                                        else {
                                            audience.push({
                                                username: ret_l.code,
                                                pg: ['h']
                                            });
                                            journalists.find({ $or: [{ sources: username }, { beat: ret_j.beat }] }, (err, ret_js) => {
                                                if (err) {
                                                    reject(err);
                                                }
                                                else {
                                                    for (let i = 0; i < ret_js.length; i++) {
                                                        let pg = [];
                                                        if (ret_js[i].beat === ret_j.beat && ret_js[i].username !== ret_j.username) {
                                                            pg.push('h');
                                                        }
                                                        if (ret_js[i].sources.indexOf(username) !== -1 && ret_js[i].username !== ret_j.username) {
                                                            pg.push('h');
                                                        }
                                                        audience.push({
                                                            username: ret_js[i].username,
                                                            pg: pg
                                                        });
                                                    }
                                                    organisations.findOne({ username: ret_j.organisation }, (err, ret_o) => {
                                                        if (err) {
                                                            reject(err);
                                                        }
                                                        else {
                                                            if (ret_o) {
                                                                audience.push({
                                                                    username: ret_o.username,
                                                                    pg: ['j']
                                                                });
                                                            }
                                                            
                                                            resolve(audience);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else if (u_type === 'o') {
                    //organisations--w/beats
                    organisations.findOne({username: username}, (err, ret_o)=>{
                        if(err){
                            reject(err);
                        }
                        else if(!ret_o){
                            resolve(null);
                        }
                        else {
                            //listeners: users, legislatoR, journalists(sources, org)
                            let audience = [];
                            users.find({ sources: username }, (err, ret_us) => {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    if(!beats){
                                        beats = [];
                                    }
                                    for (let i = 0; i < ret_us.length; i++) {
                                        //filter based on beats
                                        if(beats[0] === 'all'){
                                            audience.push({
                                                username: ret_us[i].username,
                                                pg: ['h']
                                            });
                                        }
                                        else {
                                            for(let j=0; j<beats.length; j++){
                                                let user = ret_us[i];
                                                if(user.fed_const === beats[j]){
                                                    audience.push({
                                                        username: ret_us[i].username,
                                                        pg: ['h']
                                                    });
                                                }
                                                else if(user.sen_dist === beats[j]){
                                                    audience.push({
                                                        username: ret_us[i].username,
                                                        pg: ['h']
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    let d_beats = [];
                                    if(beats[0] !== 'all'){
                                        for(let i=0; i<beats.length; i++){
                                            d_beats.push({
                                                code: beats[i]
                                            });
                                        }
                                    }
                                    
                                    if(d_beats.length === 0){
                                        d_beats.push({code: 'd_beat'});
                                    }
                                    legislators.find({$or: d_beats}, (err, ret_ls)=>{
                                        if(err){
                                            reject(err);
                                        }
                                        else {
                                            for(let i=0; i<ret_ls.length; i++){
                                                audience.push({
                                                    username: ret_ls[i].code,
                                                    pg: ['h']
                                                });
                                            }
                                            journalists.find({$or: [{sources: username}, {organisation: username}]}, (err, ret_js)=>{
                                                if(err){
                                                    reject(err);
                                                }
                                                else {
                                                    for(let i=0; i<ret_js.length; i++){
                                                        let journo = ret_js[i];
                                                        let pg = [];
                                                        if(journo.organisation === username){
                                                            pg.push('o');
                                                        }
                                                        if(journo.sources.indexOf(username) !== -1){
                                                            pg.push('h');
                                                        }
                                                        audience.push({
                                                            username: journo.username,
                                                            pg: pg
                                                        });
                                                    }
                                                    
                                                    resolve(audience);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else if (u_type === 'l') {
                    //legislators
                    legislators.findOne({code: username}, (err, ret_l)=>{
                        if(err){
                            reject(err);
                        }
                        else if(!ret_l){
                            resolve(null);
                        }
                        else {
                            //listeners: journalists, users
                            let audience = [];
                            users.find({$or: [{sources: username}, {fed_const: username}, {sen_dist: username}]}, (err, ret_us)=>{
                                if(err){
                                    reject(err);
                                }
                                else {
                                    for(let i=0; i<ret_us.length; i++){
                                        audience.push({
                                            username: ret_us[i].username,
                                            pg: ['h']
                                        });
                                    }
                                    journalists.find({$or: [{sources: username}, {beat: username}]}, (err, ret_js)=>{
                                        if(err){
                                            reject(err);
                                        }
                                        else {
                                            for(let i=0; i<ret_js.length; i++){
                                                let journo = ret_js[i];
                                                let pg = [];
                                                if(journo.beat === username){
                                                    pg.push('h');
                                                }
                                                if(journo.sources.indexOf(username) !== -1){
                                                    pg.push('h');
                                                }

                                                audience.push({
                                                    username: journo.username,
                                                    pg: pg
                                                });
                                            }

                                            resolve(audience);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
            else {
                resolve(null);
            }
        });
    });
}
//two possible outcomes from .then are null and [], apart from an actual populated array, which fits into [1]
module.exports = collate;