const events = require('events');
const users = require('./schemas/users');
const organisations = require('./schemas/organisations');
const journalists = require('./schemas/journalists');

const EventEmitter = events.EventEmitter;

function follow(req, res) {
    let username = '';
    let type = req.params.type;
    let org_type = req.params.org_type;
    let org_username = req.params.username;

    if (type == 'u') {
        username = req.user.user.username;

        users.findOne({ username: username }, (err, ret_u) => {
            if (err) {
                throw err;
            }
            else if (!ret_u) {
                res.send({success: false, error: 'Invalid request'});
            }
            else if (ret_u.sources.indexOf(org_username) != -1) {
                res.send({success: false, error: 'Invalid request'});
            }
            else {
                if (org_type == 'org') {
                    organisations.findOne({ username: org_username }, (err, ret_o) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_o) {
                            res.redirect('/');
                        }
                        else {
                            journalists.find(({ organisation: org_username, $or: [{ beat: ret_u.fed_const }, { beat: ret_u.sen_dist }] }), (err, ret_js) => {
                                if (err) {
                                    throw err;
                                }
                                else if (ret_js.length == 0) {
                                    console.log("An error occured finding reporters reporting for " + org_username + " under " + ret_u.fed_const + " " + ret_u.sen_dist);
                                    res.send({ success: false, error: "An error occured on our end. We're working on it. Please check back shortly" });
                                }
                                else {
                                    // accepted
                                    //effect changes in all documents
                                    let fed_const = ret_u.fed_const;
                                    let sen_dist = ret_u.sen_dist;

                                    ret_u.sourceSel = true;
                                    let curr_index = ret_u.sources.length;
                                    ret_u.sources[curr_index] = org_username;

                                    ret_o.followersNo++;
                                    //for followers, it's based on beat
                                    let fedBeatIndex = -1;//don't use num; push
                                    let senBeatIndex = -1;
                                    let followers = ret_o.followers;

                                    for (let i = 0; i < followers.length; i++) {
                                        let beat = followers[i];
                                        if (beat.name == fed_const) {
                                            fedBeatIndex = i;
                                        }
                                        if (beat.name == sen_dist) {
                                            senBeatIndex = i;
                                        }
                                    }

                                    //actually populate array
                                    //beat is: name, num of followers, and type

                                    //for fed_const
                                    if (fedBeatIndex == -1) {
                                        //beat doesn't exist... create
                                        followers.push({
                                            name: fed_const,
                                            number: 1,
                                            type: 'rep'
                                        });
                                    }
                                    else {
                                        //beat exists
                                        let beat = followers[fedBeatIndex];
                                        beat.number++;
                                    }

                                    if (senBeatIndex == -1) {
                                        followers.push({
                                            name: sen_dist,
                                            number: 1,
                                            type: 'sen'
                                        });
                                    }
                                    else {
                                        let beat = followers[senBeatIndex];
                                        beat.number++;
                                    }

                                    //updated journalists
                                    ret_js.forEach(ret_j => {
                                        ret_j.followersNo++;
                                    });

                                    //actual updating
                                    users.findOneAndUpdate({ username: username }, ret_u, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            organisations.findOneAndUpdate({ username: org_username }, ret_o, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    let final = ret_js.length - 1;
                                                    let finished = new EventEmitter();

                                                    finished.on('done', () => {
                                                        res.send({
                                                            success: true
                                                        });
                                                    });

                                                    for (let j = 0; j < ret_js.length; j++) {
                                                        let ret_j = ret_js[j];
                                                        journalists.findOneAndUpdate({ username: ret_j.username }, ret_j, (err) => {
                                                            if (err) {
                                                                throw err;
                                                            }
                                                            else if (j == final) {
                                                                finished.emit('done');
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else if (org_type == 'j'){
                    journalists.findOne({username: org_username}, (err, ret_j)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_j || ret_j.account.type != 'freelance' || !ret_j.account.status){
                            res.send({success: false, error: 'Invalid request'});
                        }
                        else {
                            ret_j.followersNo++;
                            ret_u.sources.push(org_username);

                            users.findOneAndUpdate({username: username}, ret_u, (err)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    journalists.findOneAndUpdate({username: org_username}, ret_j, (err)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            res.send({success: true});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.send({success: false, error: 'Invalid request'});
                }
            }
        });
    }
    else {
        res.redirect('/');
    }
}

module.exports = follow;