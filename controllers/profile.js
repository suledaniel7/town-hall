const general = require('./schemas/general');
const l_render = require('./l-render');
const j_render = require('./j-render');
const o_render = require('./o-render');

function profile(req, res){
    let username = req.params.username;
    let referee = req.headers.referer;
    
    general.findOne({username: username}, (err, ret_g)=>{
        if(err){
            throw err;
        }
        else if(!ret_g){
            l_render(req, res, username);
        }
        else {
            let user_type = ret_g.identifier;
            if(user_type == 'j'){
                j_render(req, res, username);
            }
            else if(user_type == 'o'){
                o_render(req, res, username);
            }
            else {
                console.log("An error occured with the general, username:", username);
                res.redirect('/');
            }
        }
    });
}

module.exports = profile;