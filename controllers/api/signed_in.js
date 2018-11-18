const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const findActive = require('./findActive');

function signedIn(req, res){
    let curr_user = findActive(req, res);
    
    if(curr_user == 'user'){
        let username = req.user.user.username;
        users.findOne({username: username}, (err, ret_u)=>{
            if(err){
                throw err;
            }
            else if(!ret_u){
                res.send(JSON.stringify({active: false}));
            }
            else {
                res.send(JSON.stringify({active: true, u_type: 'u'}));
            }
        });
    }
    else if(curr_user == 'organisation'){
        let username = req.organisation.user.username;
        organisations.findOne({username: username}, (err, ret_o)=>{
            if(err){
                throw err;
            }
            else if(!ret_o){
                res.send(JSON.stringify({active: false}));
            }
            else {
                res.send(JSON.stringify({active: true, u_type: 'o'}));
            }
        });
    }
    else if(curr_user == 'journalist'){
        let username = req.journalist.user.username;
        journalists.findOne({username: username}, (err, ret_j)=>{
            if(err){
                throw err;
            }
            else if(!ret_j){
                res.send(JSON.stringify({active: false}));
            }
            else {
                res.send(JSON.stringify({active: true, u_type: 'j'}));
            }
        });
    }
    else if(curr_user == 'legislator'){
        let email = req.legislator.user.email;
        legislators.findOne({email: email}, (err, ret_l)=>{
            if(err){
                throw err;
            }
            else if(!ret_l){
                res.send(JSON.stringify({active: false}));
            }
            else {
                res.send(JSON.stringify({active: true, u_type: 'l'}));
            }
        });
    }
    else {
        res.send(JSON.stringify({active: false}));
    }
}

module.exports = signedIn;