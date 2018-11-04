const hash = require('password-hash');

const orgSchema = require('../schemas/organisations');

function signin(req, res) {
    let { email, password } = req.body;

    orgSchema.findOne({ email: email }, (err, user) => {
        if (err) {
            throw err;
        }
        else if (!user) {
            res.send({success: false, reason: 'Please ensure that your email address was entered accurately'});
        }
        else {
            if (!hash.verify(password, user.password)) {
                res.send({success: false, reason: 'Please ensure that your password was entered accurately'});
            }
            else {
                //set cookie
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
                res.send({success: true});
            }
        }
    });
}

module.exports = signin;