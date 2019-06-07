const hash = require('password-hash');

const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');

const save_auth = require('./save_auth');

function signin(req, res){
    let {email, password} = req.body;
    email = email.toLowerCase();

    users.findOne({$or:[{email: email}, {username: email}]}, (err, ret_u)=>{
        if(err){
            throw err;
        }
        else if(!ret_u){
            journalists.findOne({$or:[{email: email}, {username: email}]}, (err, ret_j)=>{
                if(err){
                    throw err;
                }
                else if(!ret_j){
                    organisations.findOne({$or:[{email: email}, {username: email}]}, (err, ret_o)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_o){
                            legislators.findOne({$or:[{email: email}, {code: email}]}, (err, ret_l)=>{
                                if(err){
                                    throw err;
                                }
                                else if(!ret_l){
                                    res.send(JSON.stringify({success: false, reason: 'Invalid Town Hall Account'}));
                                }
                                else {
                                    verifyUser(ret_l, 'l', null);
                                }
                            });
                        }
                        else {
                            verifyUser(ret_o, 'o', null);
                        }
                    });
                }
                else {
                    if(ret_j.account.type === 'formal'){
                        verifyUser(ret_j, 'j', 'm');
                    }
                    else {
                        verifyUser(ret_j, 'j', 'f');
                    }
                }
            });
        }
        else {
            verifyUser(ret_u, 'u', null);
        }
    });

    function verifyUser(user, u_type, j_type){
        let u_p = user.password;
        if(hash.verify(password, u_p)){
            //valid
            if(u_type == 'u'){
                save_auth(req, res, user.username, 'u', null);
            }
            else if(u_type == 'j'){
                save_auth(req, res, user.username, 'j', j_type);
            }
            else if(u_type == 'o'){
                save_auth(req, res, user.username, 'o', null);
            }
            else if(u_type == 'l'){
                save_auth(req, res, user.code, 'l', null);
            }
        }
        else {
            res.send(JSON.stringify({success: false, reason: 'Incorrect Password'}));
        }
    }
}

module.exports = signin;