const hash = require('password-hash');
const journo = require('./schemas/journalists');

function login(req, res) {
    let email = req.body.email;
    let password = req.body.password;

    journo.findOne({ email: email }, (err, ret_j) => {
        if (err) {
            throw err;
        }
        else if (!ret_j) {
            res.render('j-signin', { error: "Please ensure that your email address is accurate" });
        }
        else {
            if (!hash.verify(password, ret_j.password)) {
                res.render('j-signin', { error: "Please ensure that your password is accurate" });
            }
            else {
                //sign out of everywhere else
                if (req.user) {
                    req.user.user = null;
                }
                if (req.organisation) {
                    req.organisation.user = null;
                }
                if (req.legislator) {
                    req.legislator.user = null;
                }

                ret_j.password = null;
                req.journalist.user = ret_j;
                res.redirect('/');
            }
        }
    });
}

module.exports = login;