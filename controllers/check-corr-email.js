const organisations = require('./schemas/organisations');

function check(req, res){
    let email = req.params.email.toLowerCase();
    let found = false;

    organisations.findOne({pub_email: email}, (err, ret_user)=>{
        if(err){
            throw err;
        }
        else {
            if(ret_user != null){
                found = true;
            }
            res.send(found);
        }
    });
}

module.exports = check;