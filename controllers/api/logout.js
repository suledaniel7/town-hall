const auth = require('../schemas/auths');

function logout(req, res){
    let ip = req.ip;
    ip = String(ip);

    auth.findOneAndRemove({ip: ip}, (err)=>{
        if(err){
            throw err;
        }
        else {
            req.user.user = null;
            req.journalist.user = null;
            req.organisation.user = null;
            req.legislator.user = null;
            
            res.send({success: true});
        }
    });
}

module.exports = logout;