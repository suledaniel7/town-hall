const assignBeat = require('./org-assign-beat-render');
const orgSchema = require('./schemas/organisations');
const districts = require('./schemas/districts');
const journalists = require('./schemas/journalists');
const messages = require('./schemas/messages');

function profileRender(req, res){
    let init_user = req.organisation.user;
    let username = init_user.username;
    orgSchema.findOne({username: username}, (err, user)=>{
        if(err){
            throw err;
        }
        else {
            if(!user){
                res.redirect('/organisations/signup');
            }
            else if (user.pendingBeat.status) {
                let journo = user.pendingBeat.username;
                assignBeat(req, res, journo);
            }
            else {
                //find a way to discover whether passwords correlate
                //now, gather information for render: beats fllg, all beats, all js, all messages
                let beats = user.districts;
                journalists.find({organisation: username, beat: /^[^\s$]/}, (err, journos)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        let f_dists = [];
                        beats.forEach(beat => {
                            districts.findOne({code: beat.code}, (err, dist)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    if(dist){
                                        f_dists.push(dist);
                                    }
                                }
                            });
                        });
                        //obtain all other districts, and mark the ones that journos follow
                        districts.find((err, dists)=>{
                            if(err){
                                throw err;
                            }
                            else {
                                f_dists.forEach(f_dist => {
                                    for(let i=0; i<dists.length; i++){
                                        if(f_dist.code == dists[i].code){
                                            dists.splice(i, 1);
                                        }
                                    }
                                });
                                //now, we have the followed districts and the unfollowed separated
                                //separating both arrays into arrays of state-based arrays
                                let s_codes = [];
                                f_dists.forEach(f_dist => {
                                    let s_code = f_dist.state_code;
                                    if(s_codes.indexOf(s_code) == -1){
                                        s_codes.push(s_code);
                                    }
                                });

                                let st_codes = []; //for general states
                                dists.forEach(dist => {
                                    let st_code = dist.state_code;
                                    if(st_codes.indexOf(st_code) == -1){
                                        st_codes.push(st_code);
                                    }
                                });
                                //compiled list of states, now using that
                                let n_f_dists = []
                                s_codes.forEach(s_code => {
                                    let state = {};
                                    state.districts = [];
                                    f_dists.forEach(f_dist => {
                                        if(f_dist.state_code == s_code){
                                            state.name = f_dist.state;
                                            if(f_dist.type == 'sen'){
                                                f_dist.sen = true;
                                            }
                                            else {
                                                f_dist.fed = true;
                                            }
                                            state.districts.push(f_dist);
                                        }
                                    });
                                    n_f_dists.push(state);
                                });

                                let n_dists = []; //for general states
                                st_codes.forEach(st_code => {
                                    let state = {};
                                    state.districts = [];
                                    dists.forEach(dist => {
                                        if(dist.state_code == st_code){
                                            state.name = dist.state;
                                            if(dist.type == 'sen'){
                                                dist.sen = true;
                                            }
                                            else {
                                                dist.fed = true;
                                            }
                                            state.districts.push(dist);
                                        }
                                    });
                                    n_dists.push(state);
                                });

                                //final compilation, having compiled states into an array of objects
                                user.f_dists = n_f_dists;
                                user.dists = n_dists;
                                user.journos = journos;

                                //find and compile messages
                                messages.find({sender: username}).sort({timestamp: -1}).exec((err, ret_msgs)=>{
                                    if(err){
                                        throw err;
                                    }
                                    else {
                                        ret_msgs.forEach(ret_m =>{
                                            ret_m.originator = true;
                                        });
                                        user.messages = ret_msgs;
                                        res.render('org-profile', user);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}

module.exports = profileRender;