const assignBeat = require('../org-assign-beat-render');
const organisations = require('../schemas/organisations');
const journalists = require('../schemas/journalists');

function reqHandler(req, res) {
    let type = req.params.type;
    let username = req.params.username;
    let j_username = req.params.j_username;

    //we only decline, so perform checks, if there is a misspelling, reject
    if (type == 'decline') {
        //right param[0]
        organisations.findOne({ username: username }, (err, ret_org) => {
            if (err) {
                throw err;
            }
            else if (!ret_org) {
                res.send({success: false, reason: "Invalid Request"}); //fake req
            }
            else {
                //check for whether org is signed in
                if (!req.organisation) {
                    res.send({success: false, reason: "Insufficient Permissions"});
                }
                else if (!req.organisation.user) {
                    res.send({success: false, reason: "Insufficient Permissions"});
                }
                else if (req.organisation.user.username != username) {
                    res.send({success: false, reason: "Insufficient Permissions"});
                }
                else {
                    //check journo targeted
                    journalists.findOne({ username: j_username }, (err, ret_j) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            if (!ret_j) {
                                res.send({success: false, reason: "Invalid Journalist Account"});
                            }
                            else {
                                ret_j.organisation = '';
                                ret_j.account.status = false;
                                ret_j.rejected = {
                                    status: true,
                                    organisation: ret_org.name
                                }
                                ret_j.verified = false;

                                let pending = ret_org.pending_reqs;
                                for (let i = 0; i < pending.length; i++) {
                                    if (pending[i].username == j_username) {
                                        pending.splice(i, 1);
                                        break;
                                    }
                                }
                                ret_org.pending = pending;
                                
                                journalists.findOneAndUpdate({ username: j_username }, ret_j, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        organisations.findOneAndUpdate({ username: username }, ret_org, (err) => {
                                            if (err) {
                                                throw err;
                                            }
                                            else {
                                                res.send({success: true});
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
    else if (type == 'accept') {
        organisations.findOne({ username: username }, (err, ret_org) => {
            if (err) {
                throw err;
            }
            else if (!ret_org) {
                res.redirect('/');
            }
            else {
                journalists.findOne({ username: j_username }, (err, ret_j) => {
                    if (err) {
                        throw err;
                    }
                    else if (!ret_j) {
                        res.redirect('/');
                    }
                    else {
                        ret_org.pendingBeat = {
                            status: true,
                            username: j_username
                        }
                        organisations.findOneAndUpdate({ username: username }, ret_org, (err) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                if(!ret_org.verification.verified){
                                    ret_j.verified = false;
                                }
                                else {
                                    ret_j.verified = true;
                                }
                                journalists.findOneAndUpdate({ username: j_username }, ret_j, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        assignBeat(req, res, ret_j.username);
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

module.exports = reqHandler;