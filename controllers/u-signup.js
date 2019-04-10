const hash = require('password-hash');
const user = require('./schemas/users');
const general = require('./schemas/general');
const districts = require('./schemas/districts');
const legislators = require('./schemas/legislators');
const convertPath = require('./uploadFilePathConversion');
const dateFn = require('./dateFn');

function signup(req, res) {
    let { f_name, username, email, password, gender, sen_dist, fed_const, v_id } = req.body;
    username = username.toLowerCase();
    email = email.toLowerCase();
    let wsp = /^\s*$/;
    if (req.file) {
        var fPath = convertPath(req.file);
    }
    else {
        if (gender == 'm') {
            var fPath = 'img/png/avatar.png';
        }
        else {
            var fPath = 'img/png/avatar-1.png';
        }
    }
    //skipping data validation
    password = hash.generate(password, { algorithm: 'sha256' });
    general.findOne({ $or: [{ email: email }, { username: username }] }, (err, ret_g) => {
        if (err) {
            throw err;
        }
        else if (ret_g) {
            if (ret_g.email == email) {
                res.redirect('/');
            }
            else {
                res.redirect('/');
            }
        }
        else {
            user.findOne({v_id: v_id}, (err, t_u)=>{
                if(err){
                    throw err;
                }
                else if(t_u){
                    res.redirect('/');
                }
                else if(wsp.test(v_id)){
                    res.redirect('/');
                }
                else {
                    districts.findOne({ code: fed_const }, (err, ret_f_const) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_f_const) {
                            res.redirect('/');
                        }
                        else {
                            legislators.findOne({ code: fed_const }, (err, ret_rep) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!ret_rep) {
                                    res.redirect('/');
                                }
                                else {
                                    districts.findOne({ code: sen_dist }, (err, ret_sen_dist) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else if (!ret_sen_dist) {
                                            res.redirect('/');
                                        }
                                        else {
                                            legislators.findOne({ code: sen_dist }, (err, ret_sen) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else if (!ret_sen) {
                                                    res.redirect('/');
                                                }
                                                else {
                                                    ret_f_const.const_num++;
                                                    ret_rep.const_num++;
                                                    ret_sen_dist.const_num++;
                                                    ret_sen.const_num++;
        
                                                    let newUser = new user({
                                                        username: username,
                                                        v_id: v_id,
                                                        f_name: f_name,
                                                        lc_f_name: f_name.toLowerCase(),
                                                        email: email,
                                                        password: password,
                                                        gender: gender,
                                                        state: ret_f_const.state,
                                                        state_code: ret_f_const.state_code,
                                                        fed_const: fed_const,
                                                        sen_dist: sen_dist,
                                                        description: "Town Hall User",
                                                        avatar: fPath,
                                                        sourceSel: false,
                                                        date_joined: dateFn(new Date(), false)
                                                    });
        
                                                    newUser.save((err) => {
                                                        if (err) {
                                                            throw err;
                                                        }
                                                        else {
                                                            let newGen = new general({
                                                                username: username,
                                                                email: email,
                                                                identifier: 'u'
                                                            });
        
                                                            newGen.save((err) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                else {
                                                                    districts.findOneAndUpdate({ code: fed_const }, ret_f_const, (err) => {
                                                                        if (err) {
                                                                            throw err;
                                                                        }
                                                                        else {
                                                                            legislators.findOneAndUpdate({ code: fed_const }, ret_rep, (err) => {
                                                                                if (err) {
                                                                                    throw err;
                                                                                }
                                                                                else {
                                                                                    districts.findOneAndUpdate({ code: sen_dist }, ret_sen_dist, (err) => {
                                                                                        if (err) {
                                                                                            throw err;
                                                                                        }
                                                                                        else {
                                                                                            legislators.findOneAndUpdate({ code: sen_dist }, ret_sen, (err) => {
                                                                                                if (err) {
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
                                    });
                                }
                            });
                        }
                    });
                }
            })
        }
    });
}

module.exports = signup;