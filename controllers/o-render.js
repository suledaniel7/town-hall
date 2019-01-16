const organisations = require('./schemas/organisations');
const districts = require('./schemas/districts');
const journalists = require('./schemas/journalists');
const messages = require('./schemas/messages');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
const strip = require('./strip');

function renderProfile(req, res, username, user) {
    organisations.findOne({ username: username }, (err, ret_o) => {
        if (err) {
            throw err;
        }
        else if (!ret_o) {
            res.redirect('/');//redirect to error page explaining what happened
        }
        else {
            if (user) {
                ret_o.canFollow = true;
                let flag = false;
                user.sources.forEach(source => {
                    if (source == ret_o.username) {
                        flag = true;
                    }
                });
                ret_o.following = flag;
            }
            ret_o.pending_reqs = null;
            ret_o.followers = null;
            ret_o.likes = null;
            ret_o.dislikes = null;
            ret_o.email = null;
            ret_o.verification.id = null;
            ret_o.password = null;
            ret_o.pendingBeat = null;

            messages.find({ sender: username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                if (err) {
                    throw err;
                }
                else {
                    let tmpMsgs = extractTags(ret_msgs, null);
                    ret_o.messages = extractMentions(tmpMsgs);

                    let c_dists = ret_o.journalists;
                    carryOn();
                    async function retrieval(c_districts) {
                        return new Promise((resolve, reject) => {
                            const lt = c_districts.length;
                            let comp_dists = [];
                            if (c_districts.length > 0) {
                                for (let i = 0; i < c_districts.length; i++) {
                                    const district = c_districts[i].beat;
                                    const j_username = c_districts[i].username;
                                    districts.findOne({ code: district }, (err, ret_d) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else if (!ret_d) {
                                            reject("Invalid District found in Organisation");
                                        }
                                        else {
                                            journalists.findOne({ username: j_username }, (err, ret_j) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else if (!ret_j) {
                                                    reject("Invalid Organisation Journalist");
                                                }
                                                else {
                                                    ret_j = strip([ret_j], ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers'])[0];
                                                    comp_dists.push({ journalist: ret_j, district: ret_d });

                                                    if (i === lt - 1) {
                                                        resolve(comp_dists);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                            else {
                                resolve([]);
                            }
                        });
                    }

                    async function carryOn() {
                        let cov_dists = await retrieval(c_dists);
                        let org_coverage = [];
                        let st_codes = [];
                        for (let i = 0; i < cov_dists.length; i++) {
                            let coverage = cov_dists[i];
                            let district = coverage.district;
                            let journalist = coverage.journalist;
                            let state = district.state_code;

                            if (st_codes.indexOf(state) === -1) {
                                st_codes.push(state);
                                org_coverage.push({
                                    state_name: district.state,
                                    districts: [{
                                        details: district,
                                        dist_name: district.name,
                                        journalist: {
                                            name: journalist.full_name,
                                            username: journalist.username
                                        }
                                    }]
                                });
                            }
                            else {
                                let index = st_codes.indexOf(state);
                                org_coverage[index].districts.push({
                                    details: district,
                                    dist_name: district.name,
                                    journalist: {
                                        name: journalist.full_name,
                                        username: journalist.username
                                    }
                                });
                            }
                        }

                        ret_o.coverage = org_coverage;
                        res.render('o-render', ret_o);
                    }
                }
            });
        }
    });
}
//dists covered w/j's on those dists
//whether they cover the user's specific districts
module.exports = renderProfile;