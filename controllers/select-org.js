let journalists = require('./schemas/journalists');
let organisations = require('./schemas/organisations');

function selectOrg(req, res) {
    let username = req.params.username;
    let org_name = req.params.organisation;

    if (req.journalist.user.username == username) {
        //first authentication passed
        //check whether the j is organised
        journalists.findOne({ username: username }, (err, journo) => {
            if (err) {
                throw err;
            }
            else {
                if (!journo) {
                    res.redirect('/');
                }
                else {
                    if (journo.account.status) {
                        //has already been org-anised
                        res.redirect('/');
                    }
                    else {
                        //passed all checks
                        //check if org exists
                        organisations.findOne({ username: org_name }, (err, org) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                if (!org) {
                                    //org doesn't exist
                                    res.redirect('/');
                                }
                                else {
                                    journo.account.status = true;
                                    journo.organisation = org_name;
                                    journo.orgName = org.name;
                                    org.pending_reqs.push(journo);
                                    //update organisation then journo

                                    organisations.findOneAndUpdate({ username: org_name }, org, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            journalists.findOneAndUpdate({ username: username }, journo, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    //updated both
                                                    res.redirect('/');
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
        });
    }
    else {
        res.redirect('/');
    }
}

module.exports = selectOrg;