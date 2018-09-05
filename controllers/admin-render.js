// const legis = require('./schemas/legislators');
const dists = require('./schemas/districts');
const stateSchema = require('./schemas/states');//because I want to use the name states for the array prop name

function render (req, res){
    stateSchema.find((err, ret_states)=>{
        if(err){
            throw err;
        }
        else {
            //obtained states as ret_states
            //now, obtain districts
            dists.find((err, ret_dists)=>{
                if(err){
                    throw err;
                }
                else {
                    let states = [];
                    ret_states.forEach((ret_state)=>{
                        //compiling the state object here
                        //contains both rep and sens
                        let state = ret_state;
                        let ret_rep_dists = ret_state.rep_dists;
                        let ret_sen_dists = ret_state.sen_dists;

                        let rep_dists = [];//array of objects
                        let sen_dists = [];//refer above
                        
                        ret_rep_dists.forEach((rep_dist)=>{
                            ret_dists.forEach((ret_dist)=>{
                                if(rep_dist == ret_dist.code){
                                    rep_dists.push(ret_dist);
                                }
                            });
                        });
                        
                        ret_sen_dists.forEach((sen_dist)=>{
                            ret_dists.forEach((ret_dist)=>{
                                if(sen_dist == ret_dist.code){
                                    sen_dists.push(ret_dist);
                                }
                            });
                        });

                        state.rep_dists = rep_dists;
                        state.sen_dists = sen_dists;
                        state._id = null;
                        states.push(state);
                    });
                    // console.log("States:", states);
                    let notifString = req.notifications.notification;
                    clearNotifs();
                    res.render('admin', {states: states, notif: notifString});
                }
            });
        }
    });
    function clearNotifs(){
        // req.notifications.destroy();
        req.notifications.notification = null;
    }
}

module.exports = render;