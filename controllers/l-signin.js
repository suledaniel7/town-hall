const hash = require('password-hash');
const legis = require('./schemas/legislators');

function login(req, res) {
    let { email, password } = req.body;
    legis.findOne({$or:[{email: email}, {code: email}]}, (err, leg) => {
        if (err) {
            throw err;
        }
        else if (!leg) {
            res.render('l-signin', { error: 'Please ensure that your email address is accurate' });
        }
        else {
            if (!hash.verify(password, leg.password)) {
                res.render('l-signin', { error: 'Please ensure that your password is accurate' });
            }
            else {
                //set session
                if (req.user) {
                    req.user.user = null;
                }
                if (req.organisation) {
                    req.organisation.user = null;
                }
                if (req.journalist) {
                    req.journalist.user = null;
                }

                req.legislator.user = leg;
                res.redirect('/');
            }
        }
    });
}

module.exports = login;