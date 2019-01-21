const hash = require('password-hash');
const users = require('./schemas/users');

function signin(req, res){
    let { email, password } = req.body;

    users.findOne({$or:[{email: email}, {username: email}]}, (err, ret_u)=>{
        if(err){
            throw err;
        }
        else if(!ret_u){
            res.render('u-signin', { error: 'Please ensure that your email address is accurate' });
        }
        else {
            if(!hash.verify(password, ret_u.password)){
                res.render('u-signin', {error: 'Please ensure that your password is accurate'});
            }
            else {
                //set session
                if (req.organisation) {
                    req.organisation.user = null;
                }
                if (req.journalist) {
                    req.journalist.user = null;
                }
                if (req.legislator) {
                    req.legislator.user = null;
                }

                req.user.user = ret_u;
                res.redirect('/');
            }
        }
    });
}

module.exports = signin;