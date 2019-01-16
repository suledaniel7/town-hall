const organisations = require('./schemas/organisations');
const legislators = require('./schemas/legislators');
const journalists = require('./schemas/journalists');
const users = require('./schemas/users');

//warning. This could make the program hang indefinitely if there is no active user
//we cannot include an else anywhere because all code runs and the code works this way to ensure everywhere is checked
//oh, yeah. They're also all async so...
function findUser(req){
    return new Promise((resolve, reject)=>{
        if(req.user){
            if(req.user.user){
                let username = req.user.user.username;
                users.findOne({username: username}, (err, ret_u)=>{
                    checked = true;
                    if(err){
                        reject(err);
                    }
                    else if(!ret_u){
                        resolve(null);
                    }
                    else {
                        resolve(ret_u);
                    }
                });
            }
        }
        if(req.organisation){
            if(req.organisation.user){
                let username = req.organisation.user.username;
                organisations.findOne({username: username}, (err, ret_o)=>{
                    checked = true;
                    if(err){
                        reject(err);
                    }
                    else if(!ret_o){
                        resolve(null);
                    }
                    else {
                        resolve(ret_o);
                    }
                });
            }
        }
        if(req.journalist){
            if(req.journalist.user){
                let username = req.journalist.user.username;
                journalists.findOne({username: username}, (err, ret_j)=>{
                    checked = true;
                    if(err){
                        reject(err);
                    }
                    else if(!ret_j){
                        resolve(null);
                    }
                    else {
                        resolve(ret_j);
                    }
                });
            }
        }
        if(req.legislator){
            if(req.legislator.user){
                let code = req.legislator.user.code;
                legislators.findOne({code: code}, (err, ret_l)=>{
                    checked = true;
                    if(err){
                        reject(err);
                    }
                    else if(!ret_l){
                        resolve(null);
                    }
                    else {
                        resolve(ret_l);
                    }
                });
            }
        }
    });
}

module.exports = findUser;