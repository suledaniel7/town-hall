const legislators = require('../schemas/legislators');
const legislation = require('../schemas/legislation');
const dateFn = require('./dateFn');
const timeFn = require('./timeFn');

function create_legis(req, res) {
    if (req.legislator) {
        if (req.legislator.user) {
            let l_code = req.legislator.user.code;
            legislators.findOne({ code: l_code }, (err, ret_l) => {
                if (err) {
                    throw err;
                }
                else if (!ret_l) {
                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                }
                else {
                    let { sponsors, title, official_title, description, text_link } = req.body;
                    if(!sponsors){
                        sponsors = [];
                    }
                    let wsp = /^\s*$/;
                    if (wsp.test(title) || wsp.test(official_title) || wsp.test(description) || wsp.test(text_link)) {
                        res.send(JSON.stringify({ success: false, reason: "All fields are required" }));
                    }
                    else {
                        //add the originator as sponsor primus
                        let s_index = sponsors.indexOf(l_code);
                        if (s_index === -1) {
                            sponsors = [l_code].concat(sponsors);
                        }
                        function check_legs(legs) {
                            return new Promise((resolve, reject) => {
                                let fin_legs = [];
                                let length = legs.length;
                                let done = 0;
                                if (length === 0) {
                                    resolve(null);
                                }
                                else {
                                    for (let i = 0; i < length; i++) {
                                        let c_leg = legs[i];
                                        legislators.findOne({ code: c_leg }, (err, ret_c_l) => {
                                            if (err) {
                                                reject(err);
                                            }
                                            else if (!ret_c_l) {
                                                reject({ user: c_leg, r_text: 'Invalid Co-Sponsor' });
                                            }
                                            else {
                                                done++;
                                                fin_legs.push({
                                                    code: ret_c_l.code,
                                                    full_name: ret_c_l.full_name,
                                                    type: ret_c_l.type,
                                                    type_exp: ret_c_l.type_exp,
                                                    district: ret_c_l.district,
                                                    state: ret_c_l.state,
                                                    avatar: ret_c_l.avatar
                                                });
                                                if (done === length) {
                                                    resolve(fin_legs);
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }

                        check_legs(sponsors).then((val) => {
                            if (!val) {
                                res.send(JSON.stringify({ success: false, reason: "No sponsors defined" }));
                            }
                            else {
                                let sponsor_details = val;
                                //create code
                                let d = new Date();
                                let d_c = dateFn(d, false);
                                let t_c = timeFn(d);
                                let timestamp = d.getTime();
                                let code = ``
                                //add users
                                if (sponsors.length > 1) {
                                    code += sponsors[0];
                                    code += '-';
                                    code += sponsors[1];
                                    code += '-';
                                    code += timestamp;
                                }
                                else {
                                    code = `${sponsors[0]}-${timestamp}`;
                                }

                                //done, compile and move on
                                let newLeg = new legislation({
                                    sponsors: sponsors,
                                    sponsor_details: sponsor_details,
                                    title: title,
                                    official_title: official_title,
                                    code: code,
                                    description: description,
                                    text_link: text_link,
                                    status: { active: true, s_text: "Exploratory", s_val: 'e' },
                                    date_created: d_c,
                                    time_created: t_c,
                                    timestamp: timestamp
                                });

                                newLeg.save((err) => {
                                    if (err) {
                                        res.send(JSON.stringify({ success: false, reason: "An error occured processing your request. Please try again later" }));
                                        throw err;
                                    }
                                    else {
                                        res.send(JSON.stringify({ success: true, legislation: newLeg }));
                                    }
                                });
                            }
                        }).catch((e) => {
                            let reason = "Invalid Operation";
                            if (e.r_text) {
                                reason = e.r_text + ': ' + e.user;
                            }
                            else {
                                reason = "An error occured processing your request. Please try again later";
                            }
                            res.send(JSON.stringify({ success: false, reason: reason }));
                        });
                    }
                }
            });
        }
        else {
            res.send(JSON.stringify({ success: false, reason: "You must be signed in to perform this function" }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, reason: "You must be signed in to perform this function" }));
    }
}

module.exports = create_legis;