const districts = require('../schemas/districts');

function beatSelect(req, res){
    districts.find((err, ret_dists)=>{
        if(err){
            throw err;
        }
        else {
            let states = [];
            let states_arr = [];

            ret_dists.forEach(ret_dist => {
                let state = ret_dist.state;
                if(states_arr.indexOf(state) == -1){
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
                    if(ret_dist.state == state){
                        if(ret_dist.type == 'sen'){
                            the_state.sen_dists.push(ret_dist);
                        }
                        else {
                            the_state.fed_consts.push(ret_dist);
                        }
                    }
                });
                states.push(the_state);
            });
            let username = req.journalist.user.username;
            res.send(JSON.stringify({success: true, states: states, username: username}));
        }
    });
}

module.exports = beatSelect;