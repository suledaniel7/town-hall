const strip = require('./strip');
// const extractTags = require('./extractTags');
// const extractMentions = require('./extractMentions');
const log_entry = require('./log_entry');
const users = require('../schemas/users');
const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const journalists = require('../schemas/journalists');
const messages = require('../schemas/messages');

function renderProfile(req, res) {
    let start_time = new Date();
    let item = {};
    item.u_type = 'u';
    let page = req.query.pg;

    users.findOne({ username: req.user.user.username }, (err, ret_u) => {
        if (err) {
            throw err;
        }
        else if (!ret_u) {
            req.user.user = null;
            res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
        }
        else {
            if (req.user.user.password !== ret_u.password) {
                res.send(JSON.stringify({ success: false, reason: "Some information changed since your last login. Please enter your details again" }));
            }
            else {
                ret_u.password = null;
                //if hasn't selected, redirect straight from here, so move out legs
                legislators.findOne({ code: ret_u.fed_const }, (err, rep) => {
                    if (err) {
                        throw err;
                    }
                    else if (!rep) {
                        console.log("A significant error occured finding the rep,", ret_u.fed_const, "for user,", ret_u.username);
                        req.user.user = null;
                        res.send(JSON.stringify({ success: false, reason: "An error occured on our end. Please try again later." }));
                    }
                    else {
                        legislators.findOne({ code: ret_u.sen_dist }, (err, sen) => {
                            if (err) {
                                throw err;
                            }
                            else if (!sen) {
                                console.log("A significant error occured finding the sen,", ret_u.sen_dist, "for user,", ret_u.username);
                                req.user.user = null;
                                res.send(JSON.stringify({ success: false, reason: "An error occured on our end. Please try again later." }));
                            }
                            else {
                                item.rep = strip([rep], ['password', 'email', 'likes', 'dislikes'])[0];
                                item.sen = strip([sen], ['password', 'email', 'likes', 'dislikes'])[0];
                                item.user = ret_u;
                                if (page == 'home') {
                                    if (!ret_u.sourceSel) {
                                        organisations.find({ $or: [{ districts: ret_u.fed_const }, { districts: ret_u.sen_dist }] }, (err, ret_orgs) => {
                                            if (err) {
                                                throw err;
                                            }
                                            else {
                                                ret_orgs = strip(ret_orgs, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes']);
                                                let suggested_orgs = [];
                                                if(ret_orgs.length > 0){
                                                    ret_orgs.forEach(ret_org => {
                                                        let sug_org = {
                                                            name: ret_org.name,
                                                            avatar: ret_org.logo,
                                                            bio: "Media Organisation",
                                                            tint: 'o',
                                                            username: ret_org.username
                                                        }
                                                        suggested_orgs.push(sug_org);
                                                    });
                                                    item.noOrgs = false;
                                                }
                                                else {
                                                    item.noOrgs = true;
                                                }
                                                item.suggested_orgs = suggested_orgs;

                                                messages.find({ $or: [{ sender: ret_u.fed_const }, { sender: ret_u.sen_dist }] }, (err, ret_msgs) => {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    else {
                                                        // ret_msgs = extractTags(ret_msgs, null);
                                                        // ret_msgs = extractMentions(ret_msgs);
                                                        item.messages = ret_msgs;
                                                        item.user = ret_u;
                                                        item.sourceSelNull = true;
                                                        res.send(JSON.stringify({ success: true, item: item }));
                                                        let end_time = new Date();
                                                        log_entry("Render User Profile", false, start_time, end_time);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        //obtain current sources and obtain messages from them
                                        let orgSourcesArr = [];
                                        let jSourcesArr = [];
                                        let sources = ret_u.sources;
                                        let searchSourceArr = [];

                                        sources.forEach(source => {
                                            searchSourceArr.push({ username: source });
                                        });
                                        //very messy, but, just so the arr isn't empty for the $or
                                        searchSourceArr.push({ username: '' });
                                        //now obtain the sources that are organisations to extract their journalists
                                        //simultaneously, ensure that they are organisations while extracting freelance journalists
                                        organisations.find({ $or: searchSourceArr }, (err, ret_os) => {
                                            if (err) {
                                                throw err;
                                            }
                                            else {
                                                //extract org usernames
                                                let orgUsernames = [];
                                                ret_os.forEach(ret_o => {
                                                    orgUsernames.push(ret_o.username);
                                                });
                                                sources.forEach(source => {
                                                    if (orgUsernames.indexOf(source) == -1) {
                                                        jSourcesArr.push(source);
                                                    }
                                                    else {
                                                        orgSourcesArr.push(source);
                                                    }
                                                });
                                                //extract org journos
                                                let searchJsArr = [];
                                                orgSourcesArr.forEach(orgSource => {
                                                    searchJsArr.push({ organisation: orgSource });
                                                });
                                                //same messy code
                                                searchJsArr.push({ username: '' });
                                                journalists.find({ $or: searchJsArr }, (err, ret_journos) => {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    else {
                                                        //eliminate js that aren't on beat
                                                        let ret_js = [];
                                                        for (let i = 0; i < ret_journos.length; i++) {
                                                            let journo = ret_journos[i];
                                                            if (journo.beat == ret_u.fed_const || journo.beat == ret_u.sen_dist) {
                                                                ret_js.push(journo);
                                                            }
                                                        }
                                                        //final compilation of all sources
                                                        let finalSourcesArr = [];
                                                        sources.forEach(source => {
                                                            finalSourcesArr.push(source);
                                                        });
                                                        let finalJsArr = [];
                                                        ret_js.forEach(ret_j => {
                                                            finalJsArr.push(ret_j.username);
                                                        });
                                                        let finalSearchArr = [];
                                                        finalSourcesArr.forEach(source => {
                                                            finalSearchArr.push({ sender: source, $or: [{ beats: 'all' }, { beats: ret_u.fed_const }, { beats: ret_u.sen_dist }] });
                                                        });
                                                        finalJsArr.forEach(journo => {
                                                            finalSearchArr.push({ sender: journo });
                                                        });

                                                        for(let i=0; i<sources.length; i++){
                                                            let username = sources[i];
                                                            if (orgUsernames.indexOf(username) == -1) {
                                                                //source isn't an org, carry on
                                                                //orgs are only for beat posts, others are for general
                                                                finalSearchArr.push({sender: username});
                                                            }
                                                        }
                                                        
                                                        finalSearchArr.push({ sender: ret_u.fed_const });
                                                        finalSearchArr.push({ sender: ret_u.sen_dist });

                                                        messages.find({ $or: finalSearchArr }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                                                            if (err) {
                                                                throw err;
                                                            }
                                                            else {
                                                                // let tmpMsgs = extractTags(ret_msgs, null);
                                                                // item.messages = extractMentions(tmpMsgs);
                                                                item.messages = ret_msgs;
                                                                item.user = ret_u;
                                                                res.send(JSON.stringify({ success: true, item: item }));
                                                                let end_time = new Date();
                                                                log_entry("Render User Profile", false, start_time, end_time);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                                else if (page == 'profile') {
                                    item.user = ret_u;
                                    res.send(JSON.stringify({ success: true, item: item }));
                                    let end_time = new Date();
                                    log_entry("Render User Profile", false, start_time, end_time);
                                }
                                else {
                                    res.send(JSON.stringify({ success: false, reason: "Invalid Page" }));
                                }
                            }
                        });
                    }
                });
            }
        }
    });
}

module.exports = renderProfile;