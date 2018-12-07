const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const legislators = require('../schemas/legislators');
const organisations = require('../schemas/organisations');
const findActive = require('./findActive');

function loadImages(req, res){
    let u_type = findActive(req, res);

    if(u_type == 'user'){
        let username = req.user.user.username;
        users.findOne({username: username}, (err, ret_u)=>{
            if(err){
                throw err;
            }
            else if(!ret_u){
                res.send({success: false, reason: "Invalid User Account"});
            }
            else {
                let avatar = ret_u.avatar;
                res.send({success: true, avatar: avatar});
            }
        });
    }
    else if(u_type == 'journalist'){
        let username = req.journalist.user.username;
        journalists.findOne({username: username}, (err, ret_u)=>{
            if(err){
                throw err;
            }
            else if(!ret_u){
                res.send({success: false, reason: "Invalid Journalist Account"});
            }
            else {
                let avatar = ret_u.avatar;
                res.send({success: true, avatar: avatar});
            }
        });
    }
    else if(u_type == 'legislator'){
        let email = req.legislator.user.email;
        legislators.findOne({email: email}, (err, ret_u)=>{
            if(err){
                throw err;
            }
            else if(!ret_u){
                res.send({success: false, reason: "Invalid Legislator Account"});
            }
            else {
                let avatar = ret_u.avatar;
                res.send({success: true, avatar: avatar});
            }
        });
    }
    else if(u_type == 'organisation'){
        let username = req.organisation.user.username;
        organisations.findOne({username: username}, (err, ret_u)=>{
            if(err){
                throw err;
            }
            else if(!ret_u){
                res.send({success: false, reason: "Invalid Organisation Account"});
            }
            else {
                let avatar = ret_u.logo;
                res.send({success: true, avatar: avatar});
            }
        });
    }
    else {
        res.send({success: false, reason: "Invalid Account"});
    }
}

module.exports = loadImages;