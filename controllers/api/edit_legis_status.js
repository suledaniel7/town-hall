const legislation = require('../schemas/legislation');

function edit(req, res) {
    let { code, status } = req.body;
    let wsp = /^\s*$/;

    if (wsp.test(code) || wsp.test(status)) {
        res.send(JSON.stringify({ success: false, reason: "Incomplete Parameters" }));
    }
    else {
        if (req.legislator) {
            if (req.legislator.user) {
                let l_code = req.legislator.user.code;

                if (l_code) {
                    legislation.findOne({ code: code }, (err, ret_leg) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_leg) {
                            res.send(JSON.stringify({ success: false, reason: "Invalid Legislation selected" }));
                        }
                        else {
                            let s_code = ret_leg.status.s_value;

                            if (status !== s_code) {
                                let stat = {
                                    active: true,
                                    s_text: '',
                                    s_value: status
                                }
                                if (status === 'e') {
                                    stat.s_text = "Exploratory";
                                }
                                else if (status === 'c') {
                                    stat.s_text = "Committee";
                                }
                                else if (status === 'f') {
                                    stat.s_text = "First Passage";
                                }
                                else if (status === 't') {
                                    stat.s_text = "Conference Committee";
                                }
                                else if (status === 'l') {
                                    stat.s_text = "Law";
                                    stat.active = false;
                                }
                                else {
                                    stat.s_text = "Withdrawn";
                                    stat.active = false;
                                }

                                ret_leg.status = stat;

                                legislation.findOneAndUpdate({ code: code }, ret_leg, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        res.send(JSON.stringify({ success: true }));
                                    }
                                });
                            }
                            else {
                                res.send(JSON.stringify({ success: false, reason: "Unchanged" }));
                            }
                        }
                    });
                }
                else {
                    res.send(JSON.stringify({ success: false, reason: "You must be signed in to access this feature" }));
                }
            }
            else {
                res.send(JSON.stringify({ success: false, reason: "You must be signed in to access this feature" }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "You must be signed in to access this feature" }));
        }
    }
}

module.exports = edit;