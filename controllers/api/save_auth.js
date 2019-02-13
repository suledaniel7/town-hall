const auth = require('../schemas/auths');

function saveAuth(req, res, username, u_type, j_type){
    //tricky
    //first, check if ip exists, if so, change username and u_type
    //else, create
    let ip = req.ip;
    ip = String(ip);
    auth.findOne({ip: ip}, (err, ret_a)=>{
        if(err){
            throw err;
        }
        else if(!ret_a){
            //doesn't exist... create
            let nAuth = new auth({
                username: username,
                ip: ip,
                u_type: u_type
            });

            nAuth.save(err => {
                if(err){
                    throw err;
                }
                else {
                    res.send(JSON.stringify({success: true, u_type: u_type, j_type: j_type}));
                }
            });
        }
        else {
            //exists... update
            ret_a.username = username;
            ret_a.u_type = u_type;

            auth.findOneAndUpdate({ip: ip}, ret_a, (err)=>{
                if(err){
                    throw err;
                }
                else {
                    res.send(JSON.stringify({success: true, u_type: u_type, j_type: j_type}));
                }
            });
        }
    })
}

module.exports = saveAuth;