const users = require('../schemas/users');
const districts = require('../schemas/districts');

function settings(req, res, username) {
    let item = {};
    users.findOne({ username: username }, (err, ret_u) => {
        if (err) {
            throw err;
        }
        else if (!ret_u) {
            res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
        }
        else if (!req.user.user) {
            res.send(JSON.stringify({success: false, reason: "You must be signed in to access this function"}));
        }
        else if (username !== req.user.user.username) {
            res.send(JSON.stringify({success: false, reason: "Invalid User Account"}));
        }
        else {
            let state_code = ret_u.state_code;
            let state = ret_u.state;
            let states = [];
            let st_codes_arr = [];
            let fed_const = '';
            let fed_const_code = ret_u.fed_const;
            let sen_dist = '';
            let sen_dist_code = ret_u.sen_dist;
            let fed_consts = [];
            let sen_dists = [];
            //get all states
            //get fed_consts and sen_dists of particular state
            districts.find().sort({state: 1, name: 1}).exec((err, ret_ds) => {
                if (err) {
                    throw err;
                }
                else {
                    for (let i = 0; i < ret_ds.length; i++) {
                        let district = ret_ds[i];
                        if (st_codes_arr.indexOf(district.state_code) === -1 && district.state_code !== state_code) {
                            st_codes_arr.push(district.state_code);
                            states.push({
                                name: district.state,
                                code: district.state_code
                            });
                        }
                        if(district.code === ret_u.fed_const){
                            fed_const = district.name;
                        }
                        else if(district.code === ret_u.sen_dist){
                            sen_dist = district.name;
                        }
                        else if (district.state_code === state_code) {
                            if (district.type === 'sen') {
                                sen_dists.push({
                                    name: district.name,
                                    code: district.code
                                });
                            }
                            else {
                                fed_consts.push({
                                    name: district.name,
                                    code: district.code
                                });
                            }
                        }
                    }
                }

                let notif = '';
                if (req.notifications.notif) {
                    notif = req.notifications.notif;
                    req.notifications.notif = null;
                }

                item.user = ret_u;
                item.state = state;
                item.states = states;
                item.state_code = state_code;
                item.fed_consts = fed_consts;
                item.sen_dists = sen_dists;
                item.u_fed_const = fed_const;
                item.u_sen_dist = sen_dist;
                item.fed_const_code = fed_const_code;
                item.sen_dist_code = sen_dist_code;
                item.notif = notif;
                
                res.send(JSON.stringify({success: true, item: item}));
            });
        }
    });
}

module.exports = settings;