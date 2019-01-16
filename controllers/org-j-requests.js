const assignBeat = require('./org-assign-beat-render');
const organisations = require('./schemas/organisations');
const journalists = require('./schemas/journalists');

function reqHandler(req, res) {
    let type = req.params.type;
    let username = req.params.username;
    let j_username = req.params.j_username;

    if (type == 'decline') {
        //right param[0]
        organisations.findOne({ username: username }, (err, ret_org) => {
            if (err) {
                throw err;
            }
            else if (!ret_org) {
                res.redirect('/'); //fake req
            }
            else {
                //check for whether org is signed in
                if (!req.organisation) {
                    res.redirect('/');
                }
                else if (!req.organisation.user) {
                    res.redirect('/');
                }
                else if (req.organisation.user.username != username) {
                    res.redirect('/');
                }
                else {
                    //check journo targeted
                    journalists.findOne({ username: j_username }, (err, ret_j) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            if (!ret_j) {
                                res.redirect('/');
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
                                let j_name = ret_j.f_name + ' ' + ret_j.l_name;
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
                                                res.send(j_name);
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
                                ret_j.description = `${ret_org.name} Journalist`;
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