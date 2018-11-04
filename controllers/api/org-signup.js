const hash = require('password-hash');
const fPath = require('./uploadFilePathConversion');
const general = require('../schemas/general');
const orgSchema = require('../schemas/organisations');

function signup(req, res) {
    let { name, username, email, email_corr, password, id } = req.body;
    let wsp = /^\s*$/;
    let test = (str) => {
        return wsp.test(str);
    }
    if (test(name) || test(username) || test(email) || test(email_corr) || test(password)) {
        res.render('org-signup', { error: "All fields marked * are required" });
    }
    else {
        username = username.toLowerCase();
        email = email.toLowerCase();
        email_corr = email_corr.toLowerCase();
        var logo = 'img/png/link.png';

        if (!id) {
            var verification = {
                verified: false
            }
        }
        else {
            var verification = {
                verified: true,
                id: id
            }
        }

        password = hash.generate(password, { algorithm: 'sha256' });

        //check for whether org exists, also ajax-ify it in the hbs file
        general.findOne({ $or: [{ username: username }, { email: email }] }, (err, ret_g) => {
            if (err) {
                throw err;
            }
            else if (ret_g) {
                if (ret_g.username == username) {
                    res.send({success: false, reason: 'A user exists with that username. Please choose another'});
                }
                else {
                    res.send({success: false, reason: 'A user exists with that Email Address. Please choose another'});
                }
            }
            else {
                //check public email via orgschema
                orgSchema.findOne({ pub_email: email_corr }, (err, ret_o) => {
                    if (err) {
                        throw err;
                    }
                    else if (ret_o) {
                        res.send({success: false, reason: 'A user exists with that Correspondence Email Address. Please choose another'});
                    }
                    else {
                        const newOrg = new orgSchema({
                            name: name,
                            lc_name: name.toLowerCase(),
                            username: username,
                            email: email,
                            pub_email: email_corr,
                            verification: verification,
                            password: password,
                            pendingBeat: {
                                status: false,
                                username: ''
                            },
                            followers: [],
                            followersNo: 0,
                            logo: logo
                        });

                        const newGen = new general({
                            username: username,
                            email: email,
                            identifier: 'o'
                        });

                        newOrg.save((err) => {
                            if (err) {
                                res.send({success: false, reason: 'A user exists with that username. Please choose another'});
                                throw err;
                            }
                            else {
                                newGen.save(err => {
                                    if (err) {
                                        throw err;//implement rollback
                                    }
                                    else {
                                        if (req.user) {
                                            req.user.user = null;
                                        }
                                        if (req.journalist) {
                                            req.journalist.user = null;
                                        }
                                        if (req.legislator) {
                                            req.legislator.user = null;
                                        }

                                        var user = newOrg;

                                        user.password = null;
                                        req.organisation.user = user;
                                        res.send({success: true});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

module.exports = signup;