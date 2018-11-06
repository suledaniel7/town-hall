const users = require('../schemas/users');
const organisations = require('../schemas/organisations');
const journalists = require('../schemas/journalists');
const legislators = require('../schemas/legislators');
const findActive = require('./findActive');
const findType = require('./findType');

function follow(req, res) {
    let f_username = req.params.username;
    let u_type = findActive(req, res);
    //only js and us can follow
    if (u_type == 'user') {
        let username = req.user.user.username;
        users.findOne({ username: username }, (err, ret_u) => {
            if (err) {
                throw err;
            }
            else if (!ret_u) {
                res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
            }
            else {
                async function next() {
                    let target_type = await findType(f_username);
                    //check if user is already following
                    //next, add to followers list, for legs only on user part, for others, figure out
                    //then res.send. AJAX proceedings next
                    if (!target_type || target_type == 'user') {
                        //user doesn't exist
                        res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
                    }
                    else if (target_type == 'legislator') {
                        //add only to user's sources
                        legislators.findOne({ code: f_username }, (err, ret_l) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_l) {
                                res.send(JSON.stringify({success: false, reason: "Invalid Legislator Account"}));
                            }
                            else {
                                if (ret_u.sources.indexOf(f_username) == -1 && ret_u.fed_const != f_username && ret_u.sen_dist != f_username) {
                                    //not following
                                    ret_u.sources.push(f_username);
                                    if(!ret_u.sourceSel){
                                        ret_u.sourceSel = true;
                                    }
                                    users.findOneAndUpdate({ username: username }, ret_u, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            res.send(JSON.stringify({ success: true }));
                                        }
                                    });
                                }
                                else {
                                    res.send(JSON.stringify({success: false, reason: "You are already following this Account"}));
                                }
                            }
                        });
                    }
                    else if (target_type == 'journalist') {
                        //add to user's sources, update independent j's followers and update j's org's unique followers
                        journalists.findOne({ username: f_username }, (err, ret_j) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_j) {
                                res.send(JSON.stringify({success: false, reason: "Invalid J-Account"}));
                            }
                            else {
                                //j exists, add to sources post integrity check
                                if (ret_u.sources.indexOf(f_username) == -1 && ret_j.account.status) {
                                    //j is verified, and isn't already in sources
                                    ret_u.sources.push(f_username);
                                    if(!ret_u.sourceSel){
                                        ret_u.sourceSel = true;
                                    }
                                    ret_j.followersNo++;
                                    ret_j.followers.push(username);

                                    users.findOneAndUpdate({ username: username }, ret_u, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            journalists.findOneAndUpdate({ username: f_username }, ret_j, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.send(JSON.stringify({ success: true }));
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send(JSON.stringify({success: false, reason: "You are already following this Account"}));
                                }
                            }
                        });
                    }
                    else if (target_type == 'organisation') {
                        //add to user's sources, update org's followers
                        organisations.findOne({username: f_username}, (err, ret_o)=>{
                            if(err){
                                throw err;
                            }
                            else if(!ret_o){
                                res.send(JSON.stringify({success: false, reason: "Invalid Organisation Account"}));
                            }
                            else {
                                if(ret_u.sources.indexOf(f_username) == -1 && ret_o.followers.indexOf(username) == -1){
                                    if(!ret_u.sourceSel){
                                        ret_u.sourceSel = true;
                                    }
                                    ret_u.sources.push(f_username);
                                    ret_o.followers.push(username);
                                    ret_o.followersNo++;

                                    organisations.findOneAndUpdate({username: f_username}, ret_o, (err)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            users.findOneAndUpdate({username: username}, ret_u, (err)=>{
                                                if(err){
                                                    throw err;
                                                }
                                                else {
                                                    res.send(JSON.stringify({success: true}));
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send(JSON.stringify({success: false, reason: "You are already following this Account"}));
                                }
                            }
                        });
                    }
                    else {
                        res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
                    }
                }
                next();
            }
        });
    }
    else if (u_type == 'journalist') {
        let username = req.journalist.user.username;
        journalists.findOne({ username: username }, (err, ret_j) => {
            if (err) {
                throw err;
            }
            else if (!ret_j) {
                res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
            }
            else {
                async function next() {
                    let target_type = await findType(f_username);
                    //check if user is already following
                    //next, add to followers list, for legs only on user part, for others, figure out
                    //then res.send. AJAX proceedings next
                    if (!target_type || target_type == 'user') {
                        //user doesn't exist
                        res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
                    }
                    else if (target_type == 'legislator') {
                        //add only to user's sources
                        legislators.findOne({ code: f_username }, (err, ret_l) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_l) {
                                res.send(JSON.stringify({success: false, reason: "Invalid Legislator Account"}));
                            }
                            else {
                                if(ret_j.sources.indexOf(f_username) == -1 && ret_j.beat != '' && ret_j.beat != f_username){
                                    ret_j.sources.push(f_username);

                                    journalists.findOneAndUpdate({username: username}, ret_j, (err)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            res.send(JSON.stringify({success: true}));
                                        }
                                    });
                                }
                                else {
                                    res.send(JSON.stringify({success: false, reason: "You are already following this Account"}));
                                }
                            }
                        });
                    }
                    else if (target_type == 'journalist') {
                        //add to user's sources, update independent j's followers
                        journalists.findOne({username: f_username}, (err, ret_f_j)=>{
                            if(err){
                                throw err;
                            }
                            else if(!ret_f_j){
                                res.send(JSON.stringify({success: false, reason: "Invalid J-Account"}));
                            }
                            else {
                                if(ret_j.sources.indexOf(f_username) == -1 && ret_f_j.followers.indexOf(username) == -1 && username != f_username){
                                    ret_j.sources.push(f_username);
                                    ret_f_j.followers.push(username);
                                    ret_f_j.followersNo++;

                                    journalists.findOneAndUpdate({username: f_username}, ret_f_j, (err)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            journalists.findOneAndUpdate({username: username}, ret_j, (err)=>{
                                                if(err){
                                                    throw err;
                                                }
                                                else{
                                                    res.send(JSON.stringify({success: true}));
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send(JSON.stringify({success: false, reason: "You are already following this Account"}));
                                }
                            }
                        });
                    }
                    else if (target_type == 'organisation') {
                        //add to user's sources, update org's followers
                        organisations.findOne({username: f_username}, (err, ret_o)=>{
                            if(err){
                                throw err;
                            }
                            else if(!ret_o){
                                res.send(JSON.stringify({success: false, reason: "Invalid Organisation Account"}));
                            }
                            else {
                                if(ret_j.sources.indexOf(f_username) == -1 && ret_o.followers.indexOf(username) == -1 && ret_j.organisation != f_username){
                                    ret_j.sources.push(f_username);
                                    ret_o.followers.push(username);
                                    ret_o.followersNo++;

                                    organisations.findOneAndUpdate({username: f_username}, ret_o, (err)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            journalists.findOneAndUpdate({username: username}, ret_j, (err)=>{
                                                if(err){
                                                    throw err;
                                                }
                                                else {
                                                    res.send(JSON.stringify({success: true}));
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send(JSON.stringify({success: false, reason: "You are already following this Account"}));
                                }
                            }
                        });
                    }
                    else {
                        res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
                    }
                }
                next();
            }
        });
    }
    else {
        res.send(JSON.stringify({success: false, reason: "You cannot follow other accounts"}));
    }
}

module.exports = follow;