const journalists = require('./schemas/journalists');
const organisations = require('./schemas/organisations');

function renderOrgs(req, res){
    let username = req.journalist.user.username;
    
    organisations.find((err, orgs)=>{
        if(err){
            throw err;
        }
        else {
            let compObj = {
                username: username,
                organisations: orgs
            }
            res.render('select-org', compObj);
        }
    });
}

module.exports = renderOrgs;