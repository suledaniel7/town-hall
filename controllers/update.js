const multer = require('multer');

const update_u = require('./update_u');
const update_j = require('./update_j');
const update_o = require('./update_o');
const update_l = require('./update_l');

const logos = multer({dest: 'public/logos/'});
const u_avatars = multer({dest: 'public/u_avatars/'});
const j_avatars = multer({dest: 'public/j_avatars/'});
const l_avatars = multer({dest: 'public/l_avatars/'});

function update(req, res){
    let u_type = req.params.u_type;
    if(u_type == 'u'){
        let u_next = u_avatars.single('avatar');
        u_next(req, res, (err)=>{
            if(err){
                throw err;
            }
            else {
                update_u(req, res);
            }
        });
    }
    else if(u_type == 'j'){
        let j_next = j_avatars.single('avatar');
        j_next(req, res, (err)=>{
            if(err){
                throw err;
            }
            else {
                update_j(req, res);
            }
        });
    }
    else if(u_type == 'o'){
        let o_next = logos.single('avatar');
        o_next(req, res, (err)=>{
            if(err){
                throw err;
            }
            else {
                update_o(req, res);
            }
        });
    }
    else if(u_type == 'l'){
        let l_next = l_avatars.single('avatar');
        l_next(req, res, (err)=>{
            if(err){
                throw err;
            }
            else {
                update_l(req, res);
            }
        });
    }
    else {
        res.redirect('/');
    }
}

module.exports = update;