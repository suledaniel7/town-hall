const states = require('./schemas/states');

function render_signup(req, res){
    states.find((err, ret_states)=>{
        if(err){
            throw err;
        }
        else {
            let statesArr = [];
            let keysArr = [];
            ret_states.forEach(ret_state => {
                let state = {
                    name: ret_state.name,
                    key: ret_state.state_code
                }
                keysArr.push(String(ret_state.state_code));
                statesArr.push(state);
            });

            res.render('u-signup', {states: statesArr, keys: keysArr});
        }
    });
}

module.exports = render_signup;