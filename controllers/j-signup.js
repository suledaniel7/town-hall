const hash = require('password-hash');
const journo = require('./schemas/journalists');
const general = require('./schemas/general');
const convertPath = require('./uploadFilePathConversion');

function signup(req, res) {
    let { f_name, l_name, username, email, password, ac_type } = req.body;
    username = username.toLowerCase();
    email = email.toLowerCase();
    let fPath = '';
    if (req.file) {
        fPath = convertPath(req.file);
    }
    else {
        fPath = 'img/png/star.png';
    }
    let account = {};
    password = hash.generate(password, { algorithm: 'sha256' });
    if (ac_type == 'm') {
        account.type = 'formal';
        account.status = false;
    }
    else if (ac_type = 'l') {
        account.type = 'freelance';
        account.status = false;
    }

    //testing for unique conditions
    //username
    general.findOne({ $or: [{ email: email }, { username: username }] }, (err, ret_user) => {
        if (err) {
            throw err;
        }
        else if (ret_user) {
            //error
            if (ret_user.email == email) {
                res.render('journalists', { error: "A user exists with that email address" });
            }
            else {
                res.render('journalists', { error: "A user exists with that username. Please choose another" });
            }
        }
        else {
            //no user found
            //create user, save in general, and save in j
            let newJourno = new journo({
                username: username,
                email: email,
                f_name: f_name,
                lc_f_name: f_name.toLowerCase(),
                l_name: l_name,
                lc_l_name: l_name.toLowerCase(),
                full_name: f_name + ' ' + l_name,
                password: password,
                account: account,
                avatar: fPath,
                orientation: false,
                verified: false,
                followersNo: 0,
                rejected: {
                    status: false,
                    organisation: ''
                },
                beatDets: {

                },
                organisation: '',
                description: 'Journalist',
                beat: ''
            });

            const newGen = new general({
                username: username,
                email: email,
                identifier: 'j'
            });

            newJourno.save((err) => {
                if (err) {
                    throw err;
                }
                else {
                    newGen.save((err) => {
                        if (err) {
                            throw err;//implement rollback for error
                        }
                        else {
                            //set session
                            ///log out of everywhere else
                            if (req.user) {
                                req.user.user = null;
                            }
                            if (req.organisation) {
                                req.organisation.user = null;
                            }
                            if (req.legislator) {
                                req.legislator.user = null;
                            }

                            newJourno.password = null;
                            req.journalist.user = newJourno;
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
}

module.exports = signup;