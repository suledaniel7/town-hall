const hash = require('password-hash');
const user = require('./schemas/users');
const general = require('./schemas/general');
const districts = require('./schemas/districts');
const convertPath = require('./uploadFilePathConversion');
const dateFn = require('./dateFn');

function signup(req, res){
    let {f_name, username, email, password, gender, state, sen_dist, fed_const} = req.body;
    if(req.file){
        var fPath = convertPath(req.file);
    }
    else {
        if(gender == 'm'){
            var fPath = 'img/png/avatar.png';
        }
        else {
            var fPath = 'img/png/avatar-1.png';
        }
    }
    //skipping data validation
    password = hash.generate(password, {algorithm: 'sha256'});
    general.findOne({$or:[{email: email}, {username: username}]}, (err, ret_g)=>{
        if(err){
            throw err;
        }
        else if(ret_g){
            if(ret_g.email == email){
                res.render('u-signup', {error: 'A user exists with that email address'});
            }
            else {
                res.render('u-signup', {error: 'A user exists with that username'});
            }
        }
        else {
            districts.findOne({code: fed_const}, (err, ret_f_const)=>{
                if(err){
                    throw err;
                }
                else if(!ret_f_const){
                    res.render('u-signup', {error: 'We ran into a problem. Please try that again'});
                }
                else {
                    districts.findOne({code: sen_dist}, (err, ret_sen_dist)=>{
                        if(err){
                            throw err;
                        }
                        else if(!ret_sen_dist){
                            res.render('u-signup', {error: 'We ran into a problem. Please try that again'});
                        }
                        else {
                            //both districts exist, and user info is valid
                            ret_f_const.const_num++;
                            ret_sen_dist.const_num++;

                            let newUser = new user({
                                username: username,
                                f_name: f_name,
                                email: email,
                                password: password,
                                state: ret_f_const.state,
                                fed_const: fed_const,
                                sen_dist: sen_dist,
                                avatar: fPath,
                                sourceSel: false,
                                date_joined: dateFn(new Date(), false)
                            });
                            
                            newUser.save((err)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    let newGen = new general({
                                        username: username,
                                        email: email,
                                        identifier: 'u'
                                    });

                                    newGen.save((err)=>{
                                        if(err){
                                            throw err;
                                        }
                                        else {
                                            districts.findOneAndUpdate({code: fed_const}, ret_f_const, (err)=>{
                                                if(err){
                                                    throw err;
                                                }
                                                else {
                                                    districts.findOneAndUpdate({code: sen_dist}, ret_sen_dist, (err)=>{
                                                        if(err){
                                                            throw err;
                                                        }
                                                        else {
                                                            if (req.organisation) {
                                                                req.organisation.user = null;
                                                            }
                                                            if (req.journalist) {
                                                                req.journalist.user = null;
                                                            }
                                                            if (req.legislator) {
                                                                req.legislator.user = null;
                                                            }
                                                            //all went well, set session
                                                            req.user.user = newUser
                                                            res.redirect('/');
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports = signup;