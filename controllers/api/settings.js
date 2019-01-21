const findType = require('./findType');
const u_s = require('./u_settings');
const j_s = require('./j_settings');
const o_s = require('./o_settings');
const l_s = require('./l_settings');

async function settings(req, res){
    let username = req.params.username;

    let u_type = await findType(username);
    if(u_type == 'user'){
        u_s(req, res, username);
    }
    else if(u_type == 'legislator'){
        l_s(req, res, username);
    }
    else if(u_type == 'organisation'){
        o_s(req, res, username);
    }
    else if(u_type == 'journalist'){
        j_s(req, res, username);
    }
    else {
        res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
    }
}

module.exports = settings;