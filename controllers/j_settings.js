const journalists = require('./schemas/journalists');
const districts = require('./schemas/districts');
const organisations = require('./schemas/organisations');

function settings(req, res, username) {
    journalists.findOne({ username: username }, (err, ret_j) => {
        if (err) {
            throw err;
        }
        else if (!ret_j) {
            res.redirect('/');
        }
        else if (!req.journalist.user) {
            res.redirect('/');
        }
        else if (username !== req.journalist.user.username) {
            res.redirect('/');
        }
        else {
            let notif = '';
            if (req.notifications.notif) {
                notif = req.notifications.notif;
                req.notifications.notif = null;
            }

            ret_j.notif = notif;
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

                    ret_j.beats = st_arr;
                    organisations.find((err, ret_os) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            for(let i=0; i<ret_os.length; i++){
                                let org = ret_os[i];
                                if(org.username === ret_j.organisation){
                                    ret_os.splice(i, 1);
                                }
                            }
                            ret_j.organisations = ret_os;
                            if(ret_j.account.type === 'formal'){
                                ret_j.formal = true;
                            }
                            else {
                                ret_j.formal = false;
                            }
                            res.render('j_settings', ret_j);
                        }
                    });
                }
            });
        }
    });
}

module.exports = settings;