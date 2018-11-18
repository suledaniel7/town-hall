const auths = require('../schemas/auths');
const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');

function authenticate(req, res, next){
    let ip = req.ip;
    ip = String(ip);

    auths.findOne({ip: ip}, (err, ret_a)=>{
        if(err){
            throw err;
        }
        else if(!ret_a){
            res.send({success: false, reason: "You must be logged in to perform this task"});
        }
        else if(ret_a.password_changed){
            res.send({success: false, reason: "Your password was changed since your last login. Please login once more"});
        }
        else {
            let u_type = ret_a.u_type;
            let username = ret_a.username;

            if(u_type == 'u'){
                users.findOne({username: username}, (err, ret_u)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        req.user.user = ret_u;
                        next();
                    }
                });
            }
            else if(u_type == 'j'){
                journalists.findOne({username: username}, (err, ret_j)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        req.journalist.user = ret_j;
                        next();
                    }
                });
            }
            else if(u_type == 'o'){
                organisations.findOne({username: username}, (err, ret_o)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        req.organisation.user = ret_o;
                        next();
                    }
                });
            }
            else if(u_type == 'l'){
                legislators.findOne({email: username}, (err, ret_l)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        req.legislator.user = ret_l;
                        next();
                    }
                });
            }
            else {
                res.send({success: false, reason: "You must be logged in to perform this task"});
            }
        }
    });
}

module.exports = authenticate;