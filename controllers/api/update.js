// const multer = require('multer');

const update_u = require('./update_u');
const update_j = require('./update_j');
const update_o = require('./update_o');
const update_l = require('./update_l');

// const logos = multer({dest: 'public/logos/'});
// const u_avatars = multer({dest: 'public/u_avatars/'});
// const j_avatars = multer({dest: 'public/j_avatars/'});
// const l_avatars = multer({dest: 'public/l_avatars/'});

function update(req, res){
    let u_type = req.params.u_type;
    if(u_type == 'u'){
        update_u(req, res);        
    }
    else if(u_type == 'j'){
        update_j(req, res);        
    }
    else if(u_type == 'o'){
        update_o(req, res);        
    }
    else if(u_type == 'l'){
        update_l(req, res);        
    }
    else {
        res.send(JSON.stringify({success: false, reason: "Invalid Parameters"}));
    }
}

module.exports = update;