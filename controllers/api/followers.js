const general = require('../schemas/general');
const organisations = require('../schemas/organisations');
const journalists = require('../schemas/journalists');
const users = require('../schemas/users');
const legislators = require('../schemas/legislators');
const findUserWithUsername = require('./findUserWithUsername');
const findType = require('./findType');

function followers(req, res) {
    let username = req.params.username;

    findUserType(username);

    function findUserDets(username) {
        return new Promise((resolve, reject) => {
            general.findOne({ username: username }, (err, ret_g) => {
                if (err) {
                    throw err;
                }
                else if (!ret_g) {
                    resolve(null);
                }
                else {
                    resolve(ret_g.identifier);
                }
            });
        });
    }

    function findFollower(identifier, username) {
        return new Promise((resolve, reject) => {
            if (identifier === 'j') {
                journalists.findOne({ username: username }, (err, ret_j) => {
                    if (err) {
                        throw err;
                    }
                    else if (!ret_j) {
                        resolve(null);
                    }
                    else {
                        resolve(ret_j);
                    }
                });
            }
            else if (identifier === 'u') {
                users.findOne({ username: username }, (err, ret_u) => {
                    if (err) {
                        throw err;
                    }
                    else if (!ret_u) {
                        resolve(null);
                    }
                    else {
                        resolve(ret_u);
                    }
                });
            }
            else {
                resolve(null);
            }
        });
    }

    async function render(followers){
        let u_type = await findType(username);
        u_type = u_type[0];
        let user = await findUserWithUsername(u_type, username);
        let user_name = '';
        if(user){
            if(user.name){
                user_name = user.name;
            }
            else if(user.full_name){
                user_name = user.full_name;
            }
            else if(user.f_name){
                user_name = user.f_name;
            }
            else {
                user_name = "User";
            }
        }
        else {
            user_name = "User";
        }
        
        res.send(JSON.stringify({success: true, name: user_name, found: true, followers: followers}));
    }

    async function seekFollowerDetails(username) {
        let identifier = await findUserDets(username);
        let follower = await findFollower(identifier, username);
        
        return follower;
    }

    async function findUserType(username) {
        let u_type = await findType(username);

        if (u_type === 'organisation') {
            findFollowers('o', username);
        }
        else if (u_type === 'journalist') {
            findFollowers('j', username);
        }
        else if (u_type === 'legislator') {
            findFollowers('l', username);
        }
        else {
            res.send(JSON.stringify({success: true, found: false}));
        }
    }

    function findFollowers(u_type, username) {
        if (u_type === 'o') {
            organisations.findOne({ username: username }, (err, ret_o) => {
                if (err) {
                    throw err;
                }
                else if (!ret_o) {
                    res.send(JSON.stringify({success: false, reason: "Invalid Organisation"}));
                }
                else {
                    let followers = ret_o.followers;
                    let f_arr = [];
                    let f_lt = followers.length;
                    let last = f_lt - 1;
                    something(followers);

                    async function something(followers) {
                        for (let i = 0; i < f_lt; i++) {
                            let follower = await seekFollowerDetails(followers[i]);
                            if(follower){
                                if(!follower.full_name){
                                    follower.full_name = follower.f_name;
                                }
                                f_arr.push({
                                    avatar: follower.avatar,
                                    f_name: follower.f_name,
                                    full_name: follower.full_name,
                                    username: follower.username,
                                    description: follower.description
                                });
                            }

                            if(i === last){
                                render(f_arr);
                            }
                        }
                        if(f_lt === 0){
                            render(null);
                        }
                    }
                }
            });
        }
        else if (u_type === 'j') {
            journalists.findOne({ username: username }, (err, ret_j) => {
                if (err) {
                    throw err;
                }
                else if (!ret_j) {
                    res.send(JSON.stringify({success: false, reason: "Invalid Journalist"}));
                }
                else {
                    let followers = ret_j.followers;
                    let f_arr = [];
                    let f_lt = followers.length;
                    let last = f_lt - 1;
                    something(followers);

                    async function something(followers) {
                        for (let i = 0; i < f_lt; i++) {
                            let follower = await seekFollowerDetails(followers[i]);
                            if(follower){
                                if(!follower.full_name){
                                    follower.full_name = follower.f_name;
                                }
                                f_arr.push({
                                    avatar: follower.avatar,
                                    f_name: follower.f_name,
                                    full_name: follower.full_name,
                                    username: follower.username,
                                    description: follower.description
                                });
                            }

                            if(i === last){
                                render(f_arr);
                            }
                        }
                        if(f_lt === 0){
                            render(null);
                        }
                    }
                }
            });
        }
        else if (u_type === 'l') {
            legislators.findOne({ code: username }, (err, ret_l) => {
                if (err) {
                    throw err;
                }
                else if (!ret_l) {
                    res.send(JSON.stringify({success: false, reason: "Invalid Legislator"}));
                }
                else {
                    let followers = ret_l.followers;
                    let f_arr = [];
                    let f_lt = followers.length;
                    let last = f_lt - 1;
                    something(followers);

                    async function something(followers) {
                        for (let i = 0; i < f_lt; i++) {
                            let follower = await seekFollowerDetails(followers[i]);
                            if(follower){
                                if(!follower.full_name){
                                    follower.full_name = follower.f_name;
                                }
                                f_arr.push({
                                    avatar: follower.avatar,
                                    f_name: follower.f_name,
                                    full_name: follower.full_name,
                                    username: follower.username,
                                    description: follower.description
                                });
                            }

                            if(i === last){
                                render(f_arr);
                            }
                        }
                        if(f_lt === 0){
                            render(null);
                        }
                    }
                }
            });
        }
        else {
            res.send(JSON.stringify({success: false, reason: "Invalid Account Type"}));
        }
    }
}

module.exports = followers;