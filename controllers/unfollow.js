const users = require('./schemas/users');
const organisations = require('./schemas/organisations');
const journalists = require('./schemas/journalists');
const legislators = require('./schemas/legislators');
const findActive = require('./findActive');
const findType = require('./findType');

function unfollow(req, res) {
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
                res.send({ success: false, text: "Invalid User Account" });
            }
            else {
                async function next() {
                    let target_type = await findType(f_username);
                    if (!target_type || target_type == 'user') {
                        //user doesn't exist
                        res.send({ success: false, text: "Invalid User Account" });
                    }
                    else if (target_type == 'legislator') {
                        //remove from user's sources, decrement leg's followers
                        legislators.findOne({ code: f_username }, (err, ret_l) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_l) {
                                res.send({ success: false, text: "Invalid Legislator Account" });
                            }
                            else {
                                if (ret_u.sources.indexOf(f_username) != -1 && ret_u.fed_const != f_username && ret_u.sen_dist != f_username) {
                                    //not following
                                    let pop_index = ret_u.sources.indexOf(f_username);
                                    ret_u.sources.splice(pop_index, 1);
                                    
                                    let splice_index = ret_l.followers.indexOf(username);
                                    if(splice_index > -1){
                                        ret_l.followers.splice(splice_index, 1);
                                    }
                                    ret_l.followersNo--;

                                    legislators.findOneAndUpdate({ code: f_username }, ret_l, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            users.findOneAndUpdate({ username: username }, ret_u, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.send({ success: true });
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({ success: false, text: "You cannot unfollow this Account" });
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
                                res.send({ success: false, text: "Invalid J-Account" });
                            }
                            else {
                                //j exists, add to sources post integrity check
                                if (ret_u.sources.indexOf(f_username) != -1) {
                                    //j is verified, and isn't already in sources
                                    let u_pop_index = ret_u.sources.indexOf(f_username);
                                    let j_pop_index = ret_j.followers.indexOf(username);
                                    ret_u.sources.splice(u_pop_index, 1);
                                    ret_j.followersNo--;
                                    ret_j.followers.splice(j_pop_index, 1);
                                    if (ret_u.sources.length < 1) {
                                        ret_u.sourceSel = false;
                                    }

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
                                                    res.send({ success: true });
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({ success: false, text: "You are not following this Account" });
                                }
                            }
                        });
                    }
                    else if (target_type == 'organisation') {
                        //add to user's sources, update org's followers
                        organisations.findOne({ username: f_username }, (err, ret_o) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_o) {
                                res.send({ success: false, text: "Invalid Organisation Account" });
                            }
                            else {
                                if (ret_u.sources.indexOf(f_username) != -1) {
                                    let u_pop_index = ret_u.sources.indexOf(f_username);
                                    let o_pop_index = ret_o.followers.indexOf(username);
                                    ret_u.sources.splice(u_pop_index, 1);
                                    ret_o.followers.splice(o_pop_index, 1);
                                    ret_o.followersNo--;
                                    if (ret_u.sources.length < 1) {
                                        ret_u.sourceSel = false;
                                    }
                                    organisations.findOneAndUpdate({ username: f_username }, ret_o, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            users.findOneAndUpdate({ username: username }, ret_u, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.send({ success: true });
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({ success: false, text: "You are not following this Account" });
                                }
                            }
                        });
                    }
                    else {
                        res.send({ success: false, text: "Invalid User Account" });
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
                res.send({ success: false, text: "Invalid User Account" });
            }
            else {
                async function next() {
                    let target_type = await findType(f_username);
                    if (!target_type || target_type == 'user') {
                        //user doesn't exist
                        res.send({ success: false, text: "Invalid User Account" });
                    }
                    else if (target_type == 'legislator') {
                        //remove from user's sources and decrement leg's followersNo
                        legislators.findOne({ code: f_username }, (err, ret_l) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_l) {
                                res.send({ success: false, text: "Invalid Legislator Account" });
                            }
                            else {
                                if (ret_j.sources.indexOf(f_username) != -1 && ret_j.beat != '' && ret_j.beat != f_username) {
                                    let j_pop_index = ret_j.sources.indexOf(f_username);
                                    ret_j.sources.splice(j_pop_index, 1);
                                    ret_l.followersNo--;
                                    
                                    let splice_index = ret_l.followers.indexOf(username);
                                    if(splice_index > -1){
                                        ret_l.followers.splice(splice_index, 1);
                                    }

                                    legislators.findOneAndUpdate({ code: f_username }, ret_l, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            journalists.findOneAndUpdate({ username: username }, ret_j, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.send({ success: true });
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({ success: false, text: "You are either not following this Account or cannot unfollow this Account" });
                                }
                            }
                        });
                    }
                    else if (target_type == 'journalist') {
                        //add to user's sources, update independent j's followers
                        journalists.findOne({ username: f_username }, (err, ret_f_j) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_f_j) {
                                res.send({ success: false, text: "Invalid J-Account" });
                            }
                            else {
                                if (ret_j.sources.indexOf(f_username) != -1 && ret_f_j.followers.indexOf(username) != -1 && username != f_username) {
                                    let f_pop_index = ret_f_j.followers.indexOf(username);
                                    let j_pop_index = ret_j.sources.indexOf(f_username);
                                    ret_j.sources.splice(j_pop_index, 1);
                                    ret_f_j.followers.splice(f_pop_index, 1);
                                    ret_f_j.followersNo--;

                                    journalists.findOneAndUpdate({ username: f_username }, ret_f_j, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            journalists.findOneAndUpdate({ username: username }, ret_j, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.send({ success: true });
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({ success: false, text: "You are not following this Account" });
                                }
                            }
                        });
                    }
                    else if (target_type == 'organisation') {
                        //add to user's sources, update org's followers
                        organisations.findOne({ username: f_username }, (err, ret_o) => {
                            if (err) {
                                throw err;
                            }
                            else if (!ret_o) {
                                res.send({ success: false, text: "Invalid Organisation Account" });
                            }
                            else {
                                if (ret_j.sources.indexOf(f_username) != -1 && ret_o.followers.indexOf(username) != -1) {
                                    let o_pop_index = ret_o.followers.indexOf(username);
                                    let j_pop_index = ret_j.sources.indexOf(f_username);
                                    ret_j.sources.splice(j_pop_index, 1);
                                    ret_o.followers.splice(o_pop_index, 1);
                                    ret_o.followersNo--;

                                    organisations.findOneAndUpdate({ username: f_username }, ret_o, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            journalists.findOneAndUpdate({ username: username }, ret_j, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    res.send({ success: true });
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    res.send({ success: false, text: "You are not following this Account" });
                                }
                            }
                        });
                    }
                    else {
                        res.send({ success: false, text: "Invalid User Account" });
                    }
                }
                next();
            }
        });
    }
    else {
        res.send({ success: false, text: "You cannot unfollow other accounts" });
    }
}

module.exports = unfollow;