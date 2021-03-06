const journalists = require('../schemas/journalists');
const districts = require('../schemas/districts');
const organisations = require('../schemas/organisations');

function settings(req, res, username) {
    let item = {};
    journalists.findOne({ username: username }, (err, ret_j) => {
        if (err) {
            throw err;
        }
        else if (!ret_j) {
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
        }
        else if (!req.journalist.user) {
            res.send(JSON.stringify({success: false, reason: "You must be signed in to access this function"}));
        }
        else if (username !== req.journalist.user.username) {
            res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
        }
        else {
            let notif = '';
            if (req.notifications.notif) {
                notif = req.notifications.notif;
                req.notifications.notif = null;
            }

            item.notif = notif;
            districts.find((err, ret_ds) => {
                if (err) {
                    throw err;
                }
                else {
                    let st_arr = [];
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
                    });

                    item.user = ret_j;
                    item.beats = st_arr;
                    organisations.find((err, ret_os) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            item.organisations = ret_os;
                            if(ret_j.account.type === 'formal'){
                                item.formal = true;
                            }
                            else {
                                item.formal = false;
                            }
                            res.send(JSON.stringify({success: true, item: item}));
                        }
                    });
                }
            });
        }
    });
}

module.exports = settings;