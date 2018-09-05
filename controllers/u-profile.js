const events = require('events');
const elimDup = require('./duplicateElim');
const users = require('./schemas/users');
const organisations = require('./schemas/organisations');
const legislators = require('./schemas/legislators');
const districts = require('./schemas/districts');
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
                let sourceSelDone = new eventEmitter();
                let selSeek = false;
                sourceSelDone.on('done', () => {
                    selSeek = true;
                });
                let v_ret_orgs = [];
                if (!ret_u.selSources) {
                    //hasn't selected sources... encourage to select
                    selSeek = true;
                    organisations.find({ $or: [{ districts: ret_u.fed_const }, { districts: ret_u.sen_dist }] }, (err, ret_orgs) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            ret_orgs.forEach(ret_org => {
                                if (ret_org.verification.verified) {
                                    //populate array with only verified organisations
                                    ret_org = {
                                        username: ret_org.username,
                                        name: ret_org.name,
                                        followersNo: ret_org.followersNo,
                                        logo: ret_org.logo
                                    }
                                    v_ret_orgs.push(ret_org);
                                }
                            });

                            sourceSelDone.emit('done');
                        }
                    });
                }

                districts.findOne({ code: ret_u.fed_const }, (err, fed_const) => {
                    if (err) {
                        throw err;
                    }
                    else if (!fed_const) {
                        console.log('An error occured obtaining the federal constituency of user: ' + ret_u.username);
                    }
                    else {
                        districts.findOne({ code: ret_u.sen_dist }, (err, sen_dist) => {
                            if (err) {
                                throw err;
                            }
                            else if (!sen_dist) {
                                console.log('An error occured obtaining the senatorial district of user: ' + ret_u.username);
                            }
                            else {
                                legislators.findOne({ code: ret_u.fed_const }, (err, rep) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else if (!rep) {
                                        console.log("An error occured obtaining the rep of user: " + ret_u.username);
                                    }
                                    else {
                                        rep = {
                                            full_name: rep.full_name,
                                            avatar: rep.avatar,
                                            code: rep.code,
                                            type_exp: rep.type_exp
                                        }
                                        legislators.findOne({ code: ret_u.sen_dist }, (err, sen) => {
                                            if (err) {
                                                throw err;
                                            }
                                            else if (!sen) {
                                                console.log("An error occured obtaining the sen of user: " + ret_u.username);
                                            }
                                            else {
                                                sen = {
                                                    full_name: sen.full_name,
                                                    avatar: sen.avatar,
                                                    code: sen.code,
                                                    type_exp: sen.type_exp
                                                }

                                                ret_u.sen = sen;
                                                ret_u.rep = rep;
                                                ret_u.suggested_orgs = v_ret_orgs;
                                                ret_u.fed_const = fed_const;
                                                ret_u.sen_dist = sen_dist;
                                                // Compile messages. 2
                                                // Auto-sug. 1

                                                //suggestion code
                                                let user_interests = [];
                                                ret_u.likes.forEach(like => {
                                                    user_interests.push(like);
                                                });

                                                user_interests.push(fed_const.code, sen_dist.code);

                                                let num = user_interests.length;
                                                let sourceSeekDone = new eventEmitter();
                                                let j_sources = [];
                                                let sources = [];
                                                sourceSeekDone.on('done', async () => {
                                                    await parseJs(j_sources);
                                                    carryOn();
                                                });

                                                for (let i = 0; i < num; i++) {
                                                    let curr_int = user_interests[i];
                                                    journalists.find({ beat: curr_int }, (err, ret_js) => {
                                                        if (err) {
                                                            throw err;
                                                        }
                                                        else {
                                                            ret_js.forEach((ret_j) => {
                                                                j_sources.push(ret_j);
                                                            });
                                                            if (i == num - 1) {
                                                                sourceSeekDone.emit('done');
                                                            }
                                                        }
                                                    });
                                                }

                                                function obtainOrg(org_name) {
                                                    return new Promise((resolve, reject) => {
                                                        organisations.findOne({ username: org_name }, (err, ret_o) => {
                                                            if (err) {
                                                                reject(Error(err));
                                                            }
                                                            else {
                                                                if (ret_o) {
                                                                    let org = {
                                                                        name: ret_o.name,
                                                                        username: ret_o.username,
                                                                        followersNo: ret_o.followersNo,
                                                                        logo: ret_o.logo,
                                                                        verified: ret_o.verification.verified,
                                                                        organisation: true
                                                                    }

                                                                    resolve(org)
                                                                }
                                                            }
                                                        });
                                                    });
                                                }

                                                function obtainJ(j_name) {
                                                    return new Promise((resolve, reject) => {
                                                        journalists.findOne({ username: j_name }, (err, ret_j) => {
                                                            if (err) {
                                                                reject(Error(err));
                                                            }
                                                            else {
                                                                if (ret_j) {
                                                                    let journo = {
                                                                        name: ret_j.f_name + ' ' + ret_j.l_name,
                                                                        username: ret_j.username,
                                                                        followersNo: ret_j.followersNo,
                                                                        avatar: ret_j.avatar,
                                                                        verified: false,
                                                                        organisation: false
                                                                    }
                                                                    resolve(journo);
                                                                }
                                                            }
                                                        });
                                                    });
                                                }

                                                async function extractSource(journo, verified) {
                                                    if (journo.account.type == 'formal') {
                                                        let journo_org = journo.organisation;
                                                        let source = await obtainOrg(journo_org);
                                                        return source;
                                                    }
                                                    else {
                                                        //freelance
                                                        let j_name = journo.username;
                                                        let source = await obtainJ(j_name);
                                                        return source;
                                                    }
                                                }

                                                async function parseJs(j_sources) {
                                                    //verification
                                                    for (let i = 0; i < j_sources.length; i++) {
                                                        let j_source = j_sources[i];

                                                        //based on acc completion
                                                        if (!j_source.account.status) {
                                                            j_sources.splice(i, 1);
                                                        }
                                                        //based on formal
                                                        else if (j_source.account.type == 'formal') {
                                                            if (j_source.verified) {
                                                                //verified. Extract source
                                                                let source = await extractSource(j_source, true);
                                                                sources.push(source);
                                                            }
                                                            else {
                                                                //unverified. Extract source
                                                                let source = await extractSource(j_source, false);
                                                                sources.push(source);
                                                            }
                                                        }
                                                        //freelance
                                                        else {
                                                            //unverified. Extract source
                                                            let source = await extractSource(j_source, false);
                                                            sources.push(source);
                                                        }
                                                    }
                                                }

                                                async function carryOn() {
                                                    //eliminate duplicates
                                                    sources = elimDup(sources);
                                                    //eliminate current sources
                                                    let init_sources = ret_u.sources;
                                                    for (let i = 0; i < init_sources.length; i++) {
                                                        let curr_init_source = init_sources[i];
                                                        for (let j = 0; j < sources.length; j++) {
                                                            let curr_source = sources[j];
                                                            if (curr_init_source == curr_source.username) {
                                                                sources.splice(j, 1);
                                                            }
                                                        }
                                                    }
                                                    if(sources.length > 0){
                                                        ret_u.auto_sug = true;
                                                    }
                                                    ret_u.sug_sources = sources;

                                                    let orgJs = [];
                                                    async function obtainOrgJs(sourceList){
                                                        sourceList.forEach(source => {
                                                            organisations.findOne({username: source}, (err, ret_o)=>{
                                                                if(err){
                                                                    throw err;
                                                                }
                                                                else if(ret_o){
                                                                    //extracting journos that are on beat
                                                                    ret_o.journalists.forEach(journo =>{
                                                                        if(journo.beat == fed_const.code || journo.beat == sen_dist.code){
                                                                            orgJs.push(journo);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        });
                                                        
                                                    }

                                                    await obtainOrgJs(init_sources);
                                                    finalComp();

                                                    //done with sources... on to messages

                                                    function finalComp() {
                                                        let final_sources = [];

                                                        //convert string usernames into searchable objects
                                                        init_sources.forEach(init_source => {
                                                            init_source = { sender: init_source };
                                                            final_sources.push(init_source);
                                                        });

                                                        orgJs.forEach(journo => {
                                                            journo = {sender: journo.username};
                                                            final_sources.push(journo);
                                                        });
                                                        //sources aren't always orgs - freelancers
                                                        //messages are not always for every beat, so check beat
                                                        messages.find({ $or: final_sources, $or:[{beat: fed_const.code}, {beat: sen_dist.code}, {beat: 'all'}]}).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                                                            if (err) {
                                                                throw err;//recreate districts and orgs and all user types, and check out message sending w/right params and ensure that messages from journos under orgs get through
                                                            }
                                                            else {
                                                                ret_u.messages = ret_msgs;

                                                                //next up, obtain town_hall
                                                                res.render('u-profile', ret_u);
                                                            }
                                                        });
                                                    }
                                                }
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
    });
}

module.exports = renderProfile;