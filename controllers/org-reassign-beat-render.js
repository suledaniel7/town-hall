const journalists = require('./schemas/journalists');
const districts = require('./schemas/districts');

function reassignBeat(req, res) {
    let j_username = req.params.j_username;
    if (req.organisation) {
        if (req.organisation.user) {
            let username = req.organisation.user.username;
            let o_username = req.organisation.user.username;
            journalists.findOne({ username: j_username }, (err, ret_j) => {
                if (err) {
                    throw err;
                }
                else if (!ret_j) {
                    res.redirect('/');
                }
                else {
                    if (ret_j.organisation != username) {
                        res.redirect('/');
                    }
                    else {
                        //render beats
                        let j_username = ret_j.username;
                        districts.find().sort({state: 1, name: 1}).exec((err, ret_dists) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                let states = [];
                                let states_arr = [];

                                ret_dists.forEach(ret_dist => {
                                    let state = ret_dist.state;
                                    if (states_arr.indexOf(state) == -1) {
                                        states_arr.push(state);
                                    }
                                });
                                //having compiled states, now to parse districts based on them

                                states_arr.forEach(state => {
                                    let the_state = {};
                                    the_state.name = state;
                                    the_state.fed_consts = [];
                                    the_state.sen_dists = [];

                                    ret_dists.forEach(ret_dist => {
                                        if (ret_dist.state == state) {
                                            if (ret_dist.type == 'sen') {
                                                the_state.sen_dists.push(ret_dist);
                                            }
                                            else {
                                                the_state.fed_consts.push(ret_dist);
                                            }
                                        }
                                    });
                                    states.push(the_state);
                                });
                                let j_name = ret_j.full_name;
                                return(res.render('org-reassign-beat', { states: states, o_username: o_username, j_username: j_username, j_name: j_name }));
                            }
                        })
                    }
                }
            });
        }
        else {
            res.redirect('/');
        }
    }
    else {
        res.redirect('/');
    }
}


module.exports = reassignBeat;