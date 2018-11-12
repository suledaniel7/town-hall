const hash = require('password-hash');

const users = require('../schemas/users');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');

function signin(req, res){
    let {email, password} = req.body;

    users.findOne({email: email}, (err, ret_u)=>{
        if(err){
            throw err;
        }
        else if(!ret_u){
            journalists.findOne({email: email}, (err, ret_j)=>{
                if(err){
                    throw err;
                }
                else if(!ret_j){
                    organisations.findOne({email: email}, (err, ret_o)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_o){
                            legislators.findOne({email: email}, (err, ret_l)=>{
                                if(err){
                                    throw err;
                                }
                                else if(!ret_l){
                                    res.send(JSON.stringify({success: false, reason: 'Invalid Town Hall Account'}));
                                }
                                else {
                                    verifyUser(ret_l, 'l');
                                }
                            })
                        }
                        else {
                            verifyUser(ret_o, 'o');
                        }
                    })
                }
                else {
                    verifyUser(ret_j, 'j');
                }
            })
        }
        else {
            verifyUser(ret_u, 'u');
        }
    });

    function verifyUser(user, u_type){
        let u_p = user.password;
        if(hash.verify(password, u_p)){
            //valid
            if(u_type == 'u'){
                if (req.organisation) {
                    req.organisation.user = null;
                }
                if (req.journalist) {
                    req.journalist.user = null;
                }
                if (req.legislator) {
                    req.legislator.user = null;
                }
                req.user.user = user;
            }
            else if(u_type == 'j'){
                if (req.organisation) {
                    req.organisation.user = null;
                }
                if (req.user) {
                    req.user.user = null;
                }
                if (req.legislator) {
                    req.legislator.user = null;
                }
                req.journalist.user = user;
            }
            else if(u_type == 'o'){
                if (req.user) {
                    req.user.user = null;
                }
                if (req.journalist) {
                    req.journalist.user = null;
                }
                if (req.legislator) {
                    req.legislator.user = null;
                }
                req.organisation.user = user;
            }
            else if(u_type == 'l'){
                if (req.organisation) {
                    req.organisation.user = null;
                }
                if (req.journalist) {
                    req.journalist.user = null;
                }
                if (req.user) {
                    req.user.user = null;
                }
                req.legislator.user = user;
            }

            res.send(JSON.stringify({success: true}));
        }
        else {
            res.send(JSON.stringify({success: false, reason: 'Incorrect Password'}));
        }
    }
}

module.exports = signin;