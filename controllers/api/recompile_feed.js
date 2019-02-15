const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const messages = require('../schemas/messages');
const findType = require('./findType');

function recompile(username) {
    return new Promise((resolve, reject) => {
        findType(username).then((u_type) => {
            if (!u_type) {
                resolve(null);
            }
            else {
                if (u_type === 'user') {
                    users.findOne({username: username}, (err, ret_u)=>{
                        if(err){
                            reject(err);
                        }
                        else if(!ret_u){
                            resolve(null);
                        }
                        else {
                            let orgSourcesArr = [];
                            let jSourcesArr = [];
                            let sources = ret_u.sources;
                            let searchSourceArr = [];

                            sources.forEach(source => {
                                searchSourceArr.push({ username: source });
                            });
                            //very messy, but, just so the arr isn't empty for the $or
                            searchSourceArr.push({ username: '' });
                            //now obtain the sources that are organisations to extract their journalists
                            //simultaneously, ensure that they are organisations while extracting freelance journalists
                            organisations.find({ $or: searchSourceArr }, (err, ret_os) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    //extract org usernames
                                    let orgUsernames = [];
                                    ret_os.forEach(ret_o => {
                                        orgUsernames.push(ret_o.username);
                                    });
                                    sources.forEach(source => {
                                        if (orgUsernames.indexOf(source) == -1) {
                                            jSourcesArr.push(source);
                                        }
                                        else {
                                            orgSourcesArr.push(source);
                                        }
                                    });
                                    //extract org journos
                                    let searchJsArr = [];
                                    orgSourcesArr.forEach(orgSource => {
                                        searchJsArr.push({ organisation: orgSource });
                                    });
                                    //same messy code
                                    searchJsArr.push({ username: '' });
                                    journalists.find({ $or: searchJsArr }, (err, ret_journos) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            //eliminate js that aren't on beat
                                            let ret_js = [];
                                            for (let i = 0; i < ret_journos.length; i++) {
                                                let journo = ret_journos[i];
                                                if (journo.beat == ret_u.fed_const || journo.beat == ret_u.sen_dist) {
                                                    ret_js.push(journo);
                                                }
                                            }
                                            //final compilation of all sources
                                            let finalSourcesArr = [];
                                            sources.forEach(source => {
                                                finalSourcesArr.push(source);
                                            });
                                            let finalJsArr = [];
                                            ret_js.forEach(ret_j => {
                                                finalJsArr.push(ret_j.username);
                                            });
                                            let finalSearchArr = [];
                                            finalSourcesArr.forEach(source => {
                                                finalSearchArr.push({ sender: source, $or: [{ beats: 'all' }, { beats: ret_u.fed_const }, { beats: ret_u.sen_dist }] });
                                            });
                                            finalJsArr.forEach(journo => {
                                                finalSearchArr.push({ sender: journo });
                                            });

                                            for(let i=0; i<sources.length; i++){
                                                let username = sources[i];
                                                if (orgUsernames.indexOf(username) == -1) {
                                                    //source isn't an org, carry on
                                                    //orgs are only for beat posts, others are for general
                                                    finalSearchArr.push({sender: username});
                                                }
                                            }
                                            
                                            finalSearchArr.push({ sender: ret_u.fed_const });
                                            finalSearchArr.push({ sender: ret_u.sen_dist });

                                            messages.find({ $or: finalSearchArr }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                                                if (err) {
                                                    reject(err);
                                                }
                                                else {
                                                    resolve(ret_msgs);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else if (u_type === 'journalist') {
                    journalists.findOne({ username: username }, (err, ret_j) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!ret_j) {
                            resolve(null);
                        }
                        else {
                            let j_beat = ret_j.beat;
                            let sources = ret_j.sources;
                            let searchSourceArr = [];
                            sources.forEach(source => {
                                searchSourceArr.push({ sender: source });
                            });
                            searchSourceArr.push({ beats: j_beat });
                            
                            messages.find({ $or: searchSourceArr }).sort({ timestamp: -1 }).exec((err, beat_msgs) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    resolve(beat_msgs);
                                }
                            });
                        }
                    });
                }
                else {
                    resolve(null);
                }
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = recompile;