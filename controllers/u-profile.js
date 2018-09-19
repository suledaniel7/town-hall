const events = require('events');
const strip = require('./strip');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
const users = require('./schemas/users');
const organisations = require('./schemas/organisations');
const legislators = require('./schemas/legislators');
const journalists = require('./schemas/journalists');
const messages = require('./schemas/messages');

const eventEmitter = events.EventEmitter;

function renderProfile(req, res) {
    users.findOne({ username: req.user.user.username }, (err, ret_u) => {
        if (err) {
            throw err;
        }
        else if (!ret_u) {
            req.user.user = null;
            res.redirect('/');
        }
        else {
            if (req.user.user.password !== ret_u.password) {
                res.render('u-signin', { error: 'Some information changed since your last login. Please enter your details again' });
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
                        res.redirect('/');
                    }
                    else {
                        legislators.findOne({ code: ret_u.sen_dist }, (err, sen) => {
                            if (err) {
                                throw err;
                            }
                            else if (!sen) {
                                console.log("A significant error occured finding the sen,", ret_u.sen_dist, "for user,", ret_u.username);
                                req.user.user = null;
                                res.redirect('/');
                            }
                            else {
                                ret_u.rep = strip([rep], ['password', 'email', 'likes', 'dislikes'])[0];
                                ret_u.sen = strip([sen], ['password', 'email', 'likes', 'dislikes'])[0];

                                if (!ret_u.sourceSel) {
                                    organisations.find({ $or: [{ districts: ret_u.fed_const }, { districts: ret_u.sen_dist }] }, (err, ret_orgs) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            ret_orgs = strip(ret_orgs, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0];
                                            ret_u.suggested_orgs = ret_orgs;
                                            
                                            messages.find({$or: [{sender: ret_u.fed_const}, {sender: ret_u.sen_dist}]}, (err, ret_msgs)=>{
                                                if(err){
                                                    throw err;
                                                }
                                                else {
                                                    ret_msgs = extractTags(ret_msgs, null);
                                                    ret_msgs = extractMentions(ret_msgs);
                                                    ret_u.messages = ret_msgs;
                                                    res.render('u-profile', ret_u);
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
                                                    ret_js.forEach(ret_j => {
                                                        finalSourcesArr.push(ret_j.username);
                                                    });
                                                    let finalSearchArr = [];
                                                    finalSourcesArr.forEach(source => {
                                                        finalSearchArr.push({ sender: source });
                                                    });
                                                    finalSearchArr.push({ sender: ret_u.fed_const });
                                                    finalSearchArr.push({ sender: ret_u.sen_dist });

                                                    messages.find({ $or: finalSearchArr }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                                                        if (err) {
                                                            throw err;
                                                        }
                                                        else {
                                                            let tmpMsgs = extractTags(ret_msgs, null);
                                                            ret_u.messages = extractMentions(tmpMsgs);
                                                            res.render('u-profile', ret_u);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
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