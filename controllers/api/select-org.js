let journalists = require('../schemas/journalists');
let organisations = require('../schemas/organisations');

function selectOrg(req, res) {
    let org_name = req.body.organisation;

    if (req.journalist.user && req.journalist.user.username) {
        //first authentication passed
        //check whether the j is organised
        let username = req.journalist.user.username;
        journalists.findOne({ username: username }, (err, journo) => {
            if (err) {
                throw err;
            }
            else {
                if (!journo) {
                    res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                }
                else {
                    if (journo.account.status) {
                        //has already been org-anised
                        res.send(JSON.stringify({success: false, reason: "Only Journalists who are not currently assigned to an Organisation or are pending approval from an Organisation may do this"}));
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
                                    res.send(JSON.stringify({success: false, reason: "The selected Organisation Account is invalid"}));
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
                                                    res.send(JSON.stringify({success: true}));
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
        res.send(JSON.stringify({success: false, reason: "Invalid Credentials"}));
    }
}

module.exports = selectOrg;