const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const legislators = require('../schemas/legislators');
const organisations = require('../schemas/organisations');
const findActive = require('./findActive');

function setBio(req, res) {
    let bio = req.body.bio;
    let u_type = findActive(req, res);
    
    if (!u_type) {
        res.send(JSON.stringify({ success: false, reason: "You must be signed in to perform this operation" }));
    }
    else {
        u_type = u_type[0];

        if (u_type === 'u') {
            let username = req.user.user.username;
            users.findOne({username: username}, (err, ret_u)=>{
                if(err){
                    throw err;
                }
                else if(!ret_u){
                    res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                }
                else {
                    ret_u.bio = bio;
                    users.findOneAndUpdate({username: username}, ret_u, (err)=>{
                        if(err){
                            throw err;
                        }
                        else {
                            res.send(JSON.stringify({success: true}));
                        }
                    });
                }
            });
        }
        else if (u_type === 'j') {
            let username = req.journalist.user.username;
            journalists.findOne({username: username}, (err, ret_j)=>{
                if(err){
                    throw err;
                }
                else if(!ret_j){
                    res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                }
                else {
                    ret_j.bio = bio;
                    journalists.findOneAndUpdate({username: username}, ret_j, (err)=>{
                        if(err){
                            throw err;
                        }
                        else {
                            res.send(JSON.stringify({success: true}));
                        }
                    });
                }
            });
        }
        else if (u_type === 'l') {
            let code = req.legislator.user.code;
            legislators.findOne({code: code}, (err, ret_l)=>{
                if(err){
                    throw err;
                }
                else if(!ret_l){
                    res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                }
                else {
                    ret_l.bio = bio;
                    legislators.findOneAndUpdate({code: code}, ret_l, (err)=>{
                        if(err){
                            throw err;
                        }
                        else {
                            res.send(JSON.stringify({success: true}));
                        }
                    });
                }
            });
        }
        else if (u_type === 'o') {
            let username = req.organisation.user.username;
            organisations.findOne({username: username}, (err, ret_o)=>{
                if(err){
                    throw err;
                }
                else if(!ret_o){
                    res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                }
                else {
                    ret_o.bio = bio;
                    organisations.findOneAndUpdate({username: username}, ret_o, (err)=>{
                        if(err){
                            throw err;
                        }
                        else {
                            res.send(JSON.stringify({success: true}));
                        }
                    });
                }
            });
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "Invalid User Type" }));
        }
    }

}

module.exports = setBio;