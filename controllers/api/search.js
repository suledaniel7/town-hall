const messages = require('../schemas/messages');
const legislators = require('../schemas/legislators');
const organisations = require('../schemas/organisations');
const journalists = require('../schemas/journalists');
const general = require('../schemas/general');
const instants = require('../schemas/instants');
const users = require('../schemas/users');
// const extractTags = require('./extractTags');
// const extractMentions = require('./extractMentions');
const findActive = require('./findActive');
const rank = require('./rank');
const sort_rank = require('./sort_rank');
const strip = require('./strip');
const decodeStr = require('./decodeStr');
const log_entry = require('./log_entry');

function search(req, res) {
    let startTime = new Date();
    let type = req.params.type;
    let raw_term = req.params.term;
    let init_term = decodeStr(raw_term, false);
    let search_term = decodeStr(raw_term, true);
    let user = findActive(req, res);
    let m_search_term = search_term;
    let item = {};
    let wsp = /^\s*$/;
    if (search_term[0] == '@') {
        type = 'people';
        search_term = search_term.slice(1);
        m_search_term = search_term.slice(1);
    }
    else if (search_term[0] == '#') {
        type = 'tag';
        m_search_term = search_term.slice(1);
    }

    instants.findOne({ name: m_search_term, type: type }, (err, ret_i) => {
        let href = '';
        if (type == 'tag') {
            href = '/search/tag/' + m_search_term;
        }
        else if (type == 'people') {
            href = '/search/people/' + m_search_term;
        }
        else {
            href = '/search/general/' + m_search_term;
        }

        if (err) {
            throw err;
        }
        else if (!ret_i) {
            //no i, create
            let inst = new instants({
                name: m_search_term,
                href: href,
                type: type,
                mentions: 1
            });

            inst.save((err) => {
                if (err) {
                    throw err;
                }
                else {
                    getSuggestions();
                }
            });
        }
        else {
            //i exists, update
            ret_i.mentions++;
            instants.findOneAndUpdate({ name: m_search_term, type: type }, ret_i, (err) => {
                if (err) {
                    throw err;
                }
                else {
                    getSuggestions();
                }
            });
        }
        function getSuggestions() {
            instants.find().sort({ mentions: -1 }).limit(10).exec((err, ret_is) => {
                if (err) {
                    throw err;
                }
                else {
                    for (let i = 0; i < ret_is.length; i++) {
                        let inst = ret_is[i];
                        if (inst.type === 'tag') {
                            inst.s_type = '#';
                        }
                        else if (inst.type === 'people') {
                            inst.s_type = '@';
                        }
                    }
                    actual_search(ret_is);
                }
            });
        }
        function actual_search(suggestions) {
            if (type == 'tag' || init_term[0] == '#') {
                let term = '';
                if (init_term[0] == '#') {
                    term = search_term.slice(1).toLowerCase();
                }
                else {
                    term = search_term.toLowerCase();
                }
                messages.find({ tags: term }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        if (user == 'legislator') {
                            let code = req.legislator.user.code;
                            legislators.findOne({ code: code }, (err, ret_l) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!ret_l) {
                                    req.legislator.user = null;
                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                }
                                else {
                                    // let tmpMsgs = extractTags(ret_msgs, code);
                                    // item.messages = extractMentions(tmpMsgs);
                                    item.messages = ret_msgs;
                                    if (item.messages.length > 0) {
                                        item.results = true;
                                    }
                                    else {
                                        item.error = "No messages were found containing that tag";
                                    }
                                    item.term = init_term;
                                    item.tint = 'l';
                                    ret_l = strip([ret_l], ['password', 'email', 'likes', 'dislikes'])[0];
                                    item.user = ret_l;
                                    item.username = ret_l.code;
                                    item.suggestions = suggestions;
                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                    let endTime = new Date();
                                    log_entry("Search", false, startTime, endTime);
                                }
                            });
                        }
                        else if (user == 'organisation') {
                            let username = req.organisation.user.username;
                            organisations.findOne({ username: username }, (err, ret_o) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!ret_o) {
                                    req.organisation.user = null;
                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                }
                                else {
                                    // let tmpMsgs = extractTags(ret_msgs, username);
                                    // item.messages = extractMentions(tmpMsgs);
                                    item.messages = ret_msgs;
                                    if (item.messages.length > 0) {
                                        item.results = true;
                                    }
                                    else {
                                        item.error = "No messages were found containing that tag";
                                    }
                                    item.term = init_term;
                                    item.tint = 'o';
                                    ret_o = strip([ret_o], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0];
                                    item.user = ret_o;
                                    item.username = ret_o.username;
                                    item.suggestions = suggestions;
                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                    let endTime = new Date();
                                    log_entry("Search", false, startTime, endTime);
                                }
                            });
                        }
                        else if (user == 'journalist') {
                            let username = req.journalist.user.username;
                            journalists.findOne({ username: username }, (err, ret_j) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!ret_j) {
                                    req.journalist.user = null;
                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                }
                                else {
                                    // let tmpMsgs = extractTags(ret_msgs, username);
                                    // item.messages = extractMentions(tmpMsgs);
                                    item.messages = ret_msgs;
                                    if (item.messages.length > 0) {
                                        item.results = true;
                                    }
                                    else {
                                        item.error = "No messages were found containing that tag";
                                    }
                                    ret_j.term = init_term;
                                    item.tint = 'j';
                                    ret_j = strip([ret_j], ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers'])[0];
                                    item.user = ret_j;
                                    item.username = ret_j.username;
                                    item.suggestions = suggestions;
                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                    let endTime = new Date();
                                    log_entry("Search", false, startTime, endTime);
                                }
                            });
                        }
                        else if (user == 'user') {
                            let username = req.user.user.username;
                            users.findOne({ username: username }, (err, ret_u) => {
                                if (err) {
                                    throw err;
                                }
                                else if (!ret_u) {
                                    req.user.user = null;
                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                }
                                else {
                                    // let tmpMsgs = extractTags(ret_msgs, null);
                                    // item.messages = extractMentions(tmpMsgs);
                                    item.messages = ret_msgs;
                                    if (item.messages.length > 0) {
                                        item.results = true;
                                    }
                                    else {
                                        item.error = "No messages were found containing that tag";
                                    }
                                    item.term = init_term;
                                    item.tint = 'u';
                                    ret_u = strip([ret_u], ['password', 'email', 'likes', 'dislikes'])[0];
                                    item.user = ret_u;
                                    item.username = ret_u.username;
                                    item.suggestions = suggestions;
                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                    let endTime = new Date();
                                    log_entry("Search", false, startTime, endTime);
                                }
                            });
                        }
                        else {
                            res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                        }
                    }
                });
            }
            else if (type == 'people' || init_term[0] == '@') {
                let term = '';
                if (init_term[0] == '@') {
                    term = init_term.slice(1).toLowerCase();
                }
                else {
                    term = search_term.toLowerCase();
                }
                general.findOne({ username: term }, (err, ret_g) => {
                    if (err) {
                        peopleSearch(term);
                    }
                    else {
                        if (!ret_g) {
                            peopleSearch(term);
                        }
                        else {
                            let p_type = ret_g.identifier;
                            if (p_type == 'o') {
                                organisations.findOne({ username: term }, (err, ret_o) => {
                                    if (err) {
                                        peopleSearch(term);
                                    }
                                    else if (!ret_o) {
                                        peopleSearch(term);
                                    }
                                    else {
                                        res.send(JSON.stringify({ success: true, redirect: true, tint: 'o', username: ret_o.username }));
                                    }
                                });
                            }
                            else if (p_type == 'j') {
                                journalists.findOne({ username: term }, (err, ret_j) => {
                                    if (err) {
                                        peopleSearch(term);
                                    }
                                    else if (!ret_j) {
                                        peopleSearch(term);
                                    }
                                    else {
                                        res.send(JSON.stringify({ success: true, redirect: true, tint: 'j', username: ret_j.username }));
                                    }
                                });
                            }
                            else if (p_type == 'l') {
                                legislators.findOne({ code: term }, (err, ret_l) => {
                                    if (err) {
                                        peopleSearch(term);
                                    }
                                    else if (!ret_l) {
                                        peopleSearch(term);
                                    }
                                    else {
                                        res.send(JSON.stringify({ success: true, redirect: true, tint: 'l', username: ret_l.code }));
                                    }
                                });
                            }
                            else if (p_type == 'u') {
                                users.findOne({ username: term }, (err, ret_u) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else if (!ret_u) {
                                        peopleSearch(term);
                                    }
                                    else {
                                        res.send(JSON.stringify({ success: true, redirect: true, tint: 'u', username: ret_u.username }));
                                    }
                                });
                            }
                            else {
                                peopleSearch(term);
                            }
                        }
                    }
                });
                function peopleSearch(term) {
                    term = RegExp(term);
                    legislators.find({ $or: [{ lc_name: term }, { lc_f_name: term }, { lc_l_name: term }, { lc_district: term }, { lc_state: term }] }, (err, ret_ls) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            journalists.find({ $or: [{ lc_f_name: term }, { lc_l_name: term }, { username: term }, { organisation: term }] }, (err, ret_js) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    users.find({ $or: [{ username: term }, { lc_f_name: term }] }, (err, ret_us) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            organisations.find({ $or: [{ username: term }, { lc_name: term }] }, (err, ret_os) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    let final_objs = [];
                                                    ret_ls = strip(ret_ls, ['password', 'likes', 'dislikes']);
                                                    ret_js = strip(ret_js, ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers']);
                                                    ret_us = strip(ret_us, ['email', 'password', 'sources', 'likes', 'dislikes', 'gender', 'state', 'state_code', 'fed_const', 'sen_dist', 'sourceSel']);
                                                    ret_os = strip(ret_os, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes']);

                                                    //rank results
                                                    let prelim_objs = [];
                                                    ret_ls.forEach(ret_l => {
                                                        let legis = {};
                                                        ret_l = rank(ret_l, term, ['lc_name', 'lc_f_name', 'lc_l_name', 'lc_district', 'lc_state']);
                                                        legis.verified = true;
                                                        legis.tint = 'l';
                                                        legis.user = ret_l.r_obj;
                                                        legis.username = ret_l.r_obj.code;
                                                        legis.name = ret_l.r_obj.type_exp + " " + ret_l.r_obj.full_name;
                                                        legis.bio = `Representing ${ret_l.r_obj.district}, ${ret_l.r_obj.state}`;
                                                        legis.avatar = ret_l.r_obj.avatar;
                                                        prelim_objs.push(legis);
                                                    });
                                                    ret_os.forEach(ret_o => {
                                                        let org = {};
                                                        ret_o = rank(ret_o, term, ['username', 'lc_name']);
                                                        org.verified = ret_o.r_obj.verification.verified;
                                                        org.tint = 'o';
                                                        org.user = ret_o.r_obj;
                                                        org.username = ret_o.r_obj.username;
                                                        org.name = ret_o.r_obj.name;
                                                        org.bio = "Media Organisation";
                                                        org.avatar = ret_o.r_obj.logo;
                                                        prelim_objs.push(org);
                                                    });
                                                    ret_us.forEach(ret_u => {
                                                        let cur_user = {};
                                                        ret_u = rank(ret_u, term, ['username', 'lc_f_name']);
                                                        cur_user.verified = false;
                                                        cur_user.tint = 'u';
                                                        cur_user.user = ret_u.r_obj;
                                                        cur_user.username = ret_u.r_obj.username;
                                                        cur_user.name = ret_u.r_obj.f_name;
                                                        cur_user.bio = "Town Hall User";
                                                        cur_user.avatar = ret_u.r_obj.avatar;
                                                        prelim_objs.push(cur_user);
                                                    });
                                                    ret_js.forEach(ret_j => {
                                                        let journo = {};
                                                        ret_j = rank(ret_j, term, ['lc_f_name', 'lc_l_name', 'username']);
                                                        journo.verified = ret_j.r_obj.verified;
                                                        journo.tint = 'j';
                                                        journo.user = ret_j.r_obj;
                                                        journo.username = ret_j.r_obj.username;
                                                        journo.name = ret_j.r_obj.full_name;
                                                        journo.avatar = ret_j.r_obj.avatar;
                                                        if (!wsp.test(ret_j.r_obj.beat)) {
                                                            if (!wsp.test(ret_j.r_obj.organisation)) {
                                                                journo.bio = `${ret_j.r_obj.orgName} Journalist`;
                                                            }
                                                            else {
                                                                journo.bio = "Freelance Journalist";
                                                            }
                                                            prelim_objs.push(journo);
                                                        }
                                                    });

                                                    final_objs = sort_rank(prelim_objs);
                                                    let results = false;
                                                    let error = "No accounts were found matching your search criteria";
                                                    if (final_objs.length > 0) {
                                                        results = true;
                                                        error = null;
                                                    }

                                                    if (user == 'user') {
                                                        let username = req.user.user.username;
                                                        users.findOne({ username: username }, (err, ret_u) => {
                                                            if (err) {
                                                                throw err;
                                                            }
                                                            else if (!ret_u) {
                                                                req.user.user = null;
                                                                res.send(JSON.stringify({ success: false, reason: "Invalid User" }));
                                                            }
                                                            else {
                                                                ret_u = strip([ret_u], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                item.user = ret_u;
                                                                item.results = results;
                                                                item.error = error;
                                                                item.term = init_term;
                                                                item.tint = 'u';
                                                                item.accounts = final_objs;
                                                                item.suggestions = suggestions;
                                                                res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                let endTime = new Date();
                                                                log_entry("Search", false, startTime, endTime);
                                                            }
                                                        });
                                                    }
                                                    else if (user == 'legislator') {
                                                        let code = req.legislator.user.code;
                                                        legislators.findOne({ code: code }, (err, ret_l) => {
                                                            if (err) {
                                                                throw err;
                                                            }
                                                            else if (!ret_l) {
                                                                req.legislator.user = null;
                                                                res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                                            }
                                                            else {
                                                                ret_l = strip([ret_l], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                item.user = ret_l;
                                                                item.results = results;
                                                                item.error = error;
                                                                item.term = init_term;
                                                                item.tint = 'l';
                                                                item.accounts = final_objs;
                                                                item.suggestions = suggestions;
                                                                res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                let endTime = new Date();
                                                                log_entry("Search", false, startTime, endTime);
                                                            }
                                                        });
                                                    }
                                                    else if (user == 'organisation') {
                                                        let username = req.organisation.user.username;
                                                        organisations.findOne({ username: username }, (err, ret_o) => {
                                                            if (err) {
                                                                throw err;
                                                            }
                                                            else if (!ret_o) {
                                                                req.organisation.user = null;
                                                                res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                                            }
                                                            else {
                                                                ret_o = strip([ret_o], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0];
                                                                item.user = ret_o;
                                                                item.results = results;
                                                                item.error = error;
                                                                item.term = init_term;
                                                                item.tint = 'o';
                                                                item.accounts = final_objs;
                                                                item.suggestions = suggestions;
                                                                res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                let endTime = new Date();
                                                                log_entry("Search", false, startTime, endTime);
                                                            }
                                                        });
                                                    }
                                                    else if (user == 'journalist') {
                                                        let username = req.journalist.user.username;
                                                        journalists.findOne({ username: username }, (err, ret_j) => {
                                                            if (err) {
                                                                throw err;
                                                            }
                                                            else if (!ret_j) {
                                                                req.journalist.user = null;
                                                                res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                                            }
                                                            else {
                                                                ret_j = strip([ret_j], ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers'])[0];
                                                                item.user = ret_j;
                                                                item.results = results;
                                                                item.error = error;
                                                                item.term = init_term;
                                                                item.tint = 'j';
                                                                item.accounts = final_objs;
                                                                item.suggestions = suggestions;
                                                                res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                let endTime = new Date();
                                                                log_entry("Search", false, startTime, endTime);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
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
            else {
                //general search
                let term = RegExp(search_term.toLowerCase());
                legislators.find({ $or: [{ lc_name: term }, { lc_f_name: term }, { lc_l_name: term }, { lc_district: term }, { lc_state: term }] }, (err, ret_ls) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        journalists.find({ $or: [{ lc_f_name: term }, { lc_l_name: term }, { username: term }, { organisation: term }] }, (err, ret_js) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                users.find({ $or: [{ username: term }, { lc_f_name: term }] }, (err, ret_us) => {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        organisations.find({ $or: [{ username: term }, { lc_name: term }] }, (err, ret_os) => {
                                            if (err) {
                                                throw err;
                                            }
                                            else {
                                                let final_objs = [];
                                                ret_ls = strip(ret_ls, ['password', 'likes', 'dislikes']);
                                                ret_js = strip(ret_js, ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers']);
                                                ret_us = strip(ret_us, ['email', 'password', 'sources', 'likes', 'dislikes', 'gender', 'state', 'state_code', 'fed_const', 'sen_dist', 'sourceSel']);
                                                ret_os = strip(ret_os, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes']);
                                                //rank results
                                                let prelim_objs = [];
                                                ret_ls.forEach(ret_l => {
                                                    let legis = {};
                                                    ret_l = rank(ret_l, term, ['lc_name', 'lc_f_name', 'lc_l_name', 'lc_district', 'lc_state']);
                                                    legis.verified = true;
                                                    legis.tint = 'l';
                                                    legis.user = ret_l.r_obj;
                                                    legis.username = ret_l.r_obj.code;
                                                    legis.name = ret_l.r_obj.type_exp + " " + ret_l.r_obj.full_name;
                                                    legis.bio = `Representing ${ret_l.r_obj.district}, ${ret_l.r_obj.state}`;
                                                    legis.avatar = ret_l.r_obj.avatar;
                                                    prelim_objs.push(legis);
                                                });
                                                ret_os.forEach(ret_o => {
                                                    let org = {};
                                                    ret_o = rank(ret_o, term, ['username', 'lc_name']);
                                                    org.verified = ret_o.r_obj.verification.verified;
                                                    org.tint = 'o';
                                                    org.user = ret_o.r_obj;
                                                    org.username = ret_o.r_obj.username;
                                                    org.name = ret_o.r_obj.name;
                                                    org.bio = "Media Organisation";
                                                    org.avatar = ret_o.r_obj.logo;
                                                    prelim_objs.push(org);
                                                });
                                                ret_us.forEach(ret_u => {
                                                    let cur_user = {};
                                                    ret_u = rank(ret_u, term, ['username', 'lc_f_name']);
                                                    cur_user.verified = false;
                                                    cur_user.tint = 'u';
                                                    cur_user.user = ret_u.r_obj;
                                                    cur_user.username = ret_u.r_obj.username;
                                                    cur_user.name = ret_u.r_obj.f_name;
                                                    cur_user.bio = "Town Hall User";
                                                    cur_user.avatar = ret_u.r_obj.avatar;
                                                    prelim_objs.push(cur_user);
                                                });
                                                ret_js.forEach(ret_j => {
                                                    let journo = {};
                                                    ret_j = rank(ret_j, term, ['lc_f_name', 'lc_l_name', 'username']);
                                                    journo.verified = ret_j.r_obj.verified;
                                                    journo.tint = 'j';
                                                    journo.user = ret_j.r_obj;
                                                    journo.username = ret_j.r_obj.username;
                                                    journo.name = ret_j.r_obj.full_name;
                                                    journo.avatar = ret_j.r_obj.avatar;
                                                    if (!wsp.test(ret_j.r_obj.beat)) {
                                                        if (!wsp.test(ret_j.r_obj.organisation)) {
                                                            journo.bio = `${ret_j.r_obj.orgName} Journalist`;
                                                        }
                                                        else {
                                                            journo.bio = "Freelance Journalist";
                                                        }
                                                        prelim_objs.push(journo);
                                                    }
                                                });

                                                final_objs = sort_rank(prelim_objs);

                                                //getting messages
                                                messages.find({ $or: [{ tags: term }, { message: term }, { sender: term }, { sender_name: term }] }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    else {
                                                        let results = false;
                                                        let error = "No results were found matching your search criteria";
                                                        if (ret_msgs.length > 0 || final_objs.length > 0) {
                                                            results = true;
                                                            error = null;
                                                        }
                                                        if (user == 'legislator') {
                                                            let code = req.legislator.user.code;
                                                            legislators.findOne({ code: code }, (err, ret_l) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                else if (!ret_l) {
                                                                    req.legislator.user = null;
                                                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                                                }
                                                                else {
                                                                    ret_l = strip([ret_l], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                    item.user = ret_l;
                                                                    item.username = ret_l.code;
                                                                    // let tmpMsgs = extractTags(ret_msgs, code);
                                                                    // item.messages = extractMentions(tmpMsgs);
                                                                    item.messages = ret_msgs;
                                                                    item.results = results;
                                                                    item.error = error;
                                                                    item.term = init_term;
                                                                    item.tint = 'l';
                                                                    item.accounts = final_objs;
                                                                    item.suggestions = suggestions;
                                                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                    let endTime = new Date();
                                                                    log_entry("Search", false, startTime, endTime);
                                                                }
                                                            });
                                                        }
                                                        else if (user == 'organisation') {
                                                            let username = req.organisation.user.username;
                                                            organisations.findOne({ username: username }, (err, ret_o) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                else if (!ret_o) {
                                                                    req.organisation.user = null;
                                                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                                                }
                                                                else {
                                                                    // let tmpMsgs = extractTags(ret_msgs, username);
                                                                    // item.messages = extractMentions(tmpMsgs);
                                                                    item.messages = ret_msgs;
                                                                    ret_o = strip([ret_o], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0];
                                                                    item.user = ret_o;
                                                                    item.username = ret_o.username;
                                                                    item.results = results;
                                                                    item.error = error;
                                                                    item.term = init_term;
                                                                    item.tint = 'o';
                                                                    item.accounts = final_objs;
                                                                    item.suggestions = suggestions;
                                                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                    let endTime = new Date();
                                                                    log_entry("Search", false, startTime, endTime);
                                                                }
                                                            });
                                                        }
                                                        else if (user == 'journalist') {
                                                            let username = req.journalist.user.username;
                                                            journalists.findOne({ username: username }, (err, ret_j) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                else if (!ret_j) {
                                                                    req.journalist.user = null;
                                                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                                                }
                                                                else {
                                                                    // let tmpMsgs = extractTags(ret_msgs, username);
                                                                    // item.messages = extractMentions(tmpMsgs);
                                                                    item.messages = ret_msgs;
                                                                    ret_j = strip([ret_j], ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers'])[0];
                                                                    item.user = ret_j;
                                                                    item.username = ret_j.username;
                                                                    item.results = results;
                                                                    item.error = error;
                                                                    item.term = init_term;
                                                                    item.tint = 'j';
                                                                    item.accounts = final_objs;
                                                                    item.suggestions = suggestions;
                                                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                    let endTime = new Date();
                                                                    log_entry("Search", false, startTime, endTime);
                                                                }
                                                            });
                                                        }
                                                        else if (user == 'user') {
                                                            let username = req.user.user.username;
                                                            users.findOne({ username: username }, (err, ret_u) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                                else if (!ret_u) {
                                                                    req.user.user = null;
                                                                    res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
                                                                }
                                                                else {
                                                                    // let tmpMsgs = extractTags(ret_msgs, null);
                                                                    // item.messages = extractMentions(tmpMsgs);
                                                                    item.messages = ret_msgs;
                                                                    ret_u = strip([ret_u], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                    item.user = ret_u;
                                                                    item.username = ret_u.username;
                                                                    item.results = results;
                                                                    item.error = error;
                                                                    item.term = init_term;
                                                                    item.tint = 'u';
                                                                    item.accounts = final_objs;
                                                                    item.suggestions = suggestions;
                                                                    res.send(JSON.stringify({ success: true, redirect: false, results: item }));
                                                                    let endTime = new Date();
                                                                    log_entry("Search", false, startTime, endTime);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            res.send(JSON.stringify({ success: false, reason: "Invalid Account" }));
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
                });
            }
        }
    });
    //otherwise user.accounts is true
}
module.exports = search;