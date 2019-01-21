const messages = require('./schemas/messages');
const legislators = require('./schemas/legislators');
const organisations = require('./schemas/organisations');
const journalists = require('./schemas/journalists');
const general = require('./schemas/general');
const instants = require('./schemas/instants');
const users = require('./schemas/users');
const extractTags = require('./extractTags');
const extractMentions = require('./extractMentions');
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
                                    res.redirect('/');
                                }
                                else {
                                    let tmpMsgs = extractTags(ret_msgs, code);
                                    ret_l.messages = extractMentions(tmpMsgs);
                                    if (ret_l.messages.length > 0) {
                                        ret_l.results = true;
                                    }
                                    else {
                                        ret_l.error = "No messages were found containing that tag";
                                    }
                                    ret_l.term = init_term;
                                    ret_l.tint = 'l';
                                    ret_l.suggestions = suggestions;
                                    res.render('search-res', ret_l);
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
                                    res.redirect('/');
                                }
                                else {
                                    let tmpMsgs = extractTags(ret_msgs, username);
                                    ret_o.messages = extractMentions(tmpMsgs);
                                    if (ret_o.messages.length > 0) {
                                        ret_o.results = true;
                                    }
                                    else {
                                        ret_o.error = "No messages were found containing that tag";
                                    }
                                    ret_o.term = init_term;
                                    ret_o.tint = 'o';
                                    ret_o.suggestions = suggestions;
                                    res.render('search-res', ret_o);
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
                                    res.redirect('/');
                                }
                                else {
                                    let tmpMsgs = extractTags(ret_msgs, username);
                                    ret_j.messages = extractMentions(tmpMsgs);
                                    if (ret_j.messages.length > 0) {
                                        ret_j.results = true;
                                    }
                                    else {
                                        ret_j.error = "No messages were found containing that tag";
                                    }
                                    ret_j.term = init_term;
                                    ret_j.tint = 'j';
                                    ret_j.suggestions = suggestions;
                                    res.render('search-res', ret_j);
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
                                    res.redirect('/');
                                }
                                else {
                                    let tmpMsgs = extractTags(ret_msgs, null);
                                    ret_u.messages = extractMentions(tmpMsgs);
                                    if (ret_u.messages.length > 0) {
                                        ret_u.results = true;
                                    }
                                    else {
                                        ret_u.error = "No messages were found containing that tag";
                                    }
                                    ret_u.term = init_term;
                                    ret_u.tint = 'u';
                                    ret_u.suggestions = suggestions;
                                    res.render('search-res', ret_u);
                                    let endTime = new Date();
                                    log_entry("Search", false, startTime, endTime);
                                }
                            });
                        }
                        else {
                            let ret_u = {};
                            let tmpMsgs = extractTags(ret_msgs, null);
                            ret_u.messages = extractMentions(tmpMsgs);
                            if (ret_u.messages.length > 0) {
                                ret_u.results = true;
                            }
                            else {
                                ret_u.error = "No messages were found containing that tag";
                            }
                            ret_u.term = init_term;
                            ret_u.tint = 'u';
                            ret_u.suggestions = suggestions;
                            res.render('search-res', ret_u);
                            let endTime = new Date();
                            log_entry("Search", false, startTime, endTime);
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
                                        res.redirect('/profile/' + ret_o.username);
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
                                        res.redirect('/profile/' + ret_j.username);
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
                                        res.redirect('/profile/' + ret_l.code);
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
                                        res.redirect('/profile/' + ret_u.username);
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
                                                    ret_ls = strip(ret_ls, ['password', 'email', 'likes', 'dislikes']);
                                                    ret_js = strip(ret_js, ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers']);
                                                    ret_us = strip(ret_us, ['email', 'password', 'sources', 'likes', 'dislikes', 'gender', 'state', 'state_code', 'fed_const', 'sen_dist', 'sourceSel']);
                                                    ret_os = strip(ret_os, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes']);

                                                    //rank results
                                                    let prelim_objs = [];
                                                    ret_ls.forEach(ret_l => {
                                                        ret_l = rank(ret_l, term, ['lc_name', 'lc_f_name', 'lc_l_name', 'lc_district', 'lc_state']);
                                                        ret_l.r_obj.verified = true;
                                                        ret_l.r_obj.tint = 'l';
                                                        prelim_objs.push(ret_l);
                                                    });
                                                    ret_os.forEach(ret_o => {
                                                        ret_o = rank(ret_o, term, ['username', 'lc_name']);
                                                        ret_o.r_obj.verified = ret_o.r_obj.verification.verified;
                                                        ret_o.r_obj.tint = 'o';
                                                        prelim_objs.push(ret_o);
                                                    });
                                                    ret_us.forEach(ret_u => {
                                                        ret_u = rank(ret_u, term, ['username', 'lc_f_name']);
                                                        ret_u.r_obj.verified = false;
                                                        ret_u.r_obj.tint = 'u';
                                                        prelim_objs.push(ret_u);
                                                    });
                                                    ret_js.forEach(ret_j => {
                                                        ret_j = rank(ret_j, term, ['lc_f_name', 'lc_l_name', 'username']);
                                                        ret_j.r_obj.tint = 'j';
                                                        prelim_objs.push(ret_j);
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
                                                                res.redirect('/');
                                                            }
                                                            else {
                                                                ret_u = strip([ret_u], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                ret_u.results = results;
                                                                ret_u.error = error;
                                                                ret_u.term = init_term;
                                                                ret_u.tint = 'u';
                                                                ret_u.accounts = final_objs;
                                                                ret_u.suggestions = suggestions;
                                                                res.render('search-res', ret_u);
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
                                                                res.redirect('/');
                                                            }
                                                            else {
                                                                ret_l = strip([ret_l], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                ret_l.results = results;
                                                                ret_l.error = error;
                                                                ret_l.term = init_term;
                                                                ret_l.tint = 'l';
                                                                ret_l.accounts = final_objs;
                                                                ret_l.suggestions = suggestions;
                                                                res.render('search-res', ret_l);
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
                                                                res.redirect('/');
                                                            }
                                                            else {
                                                                ret_o = strip([ret_o], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0];
                                                                ret_o.results = results;
                                                                ret_o.error = error;
                                                                ret_o.term = init_term;
                                                                ret_o.tint = 'o';
                                                                ret_o.accounts = final_objs;
                                                                ret_o.suggestions = suggestions;
                                                                res.render('search-res', ret_o);
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
                                                                res.redirect('/');
                                                            }
                                                            else {
                                                                ret_j = strip([ret_j], ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers'])[0];
                                                                ret_j.results = results;
                                                                ret_j.error = error;
                                                                ret_j.term = init_term;
                                                                ret_j.tint = 'j';
                                                                ret_j.accounts = final_objs;
                                                                ret_j.suggestions = suggestions;
                                                                res.render('search-res', ret_j);
                                                                let endTime = new Date();
                                                                log_entry("Search", false, startTime, endTime);
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        let ret_u = {};
                                                        ret_u.results = results;
                                                        ret_u.error = error;
                                                        ret_u.term = init_term;
                                                        ret_u.tint = 'u';
                                                        ret_u.accounts = final_objs;
                                                        ret_u.suggestions = suggestions;
                                                        res.render('search-res', ret_u);
                                                        let endTime = new Date();
                                                        log_entry("Search", false, startTime, endTime);
                                                    }
                                                }
                                            });
                                        }
                                    })

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
                                                ret_ls = strip(ret_ls, ['password', 'email', 'likes', 'dislikes']);
                                                ret_js = strip(ret_js, ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers']);
                                                ret_us = strip(ret_us, ['email', 'password', 'sources', 'likes', 'dislikes', 'gender', 'state', 'state_code', 'fed_const', 'sen_dist', 'sourceSel']);
                                                ret_os = strip(ret_os, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes']);
                                                //rank results
                                                let prelim_objs = [];
                                                ret_ls.forEach(ret_l => {
                                                    ret_l = rank(ret_l, term, ['lc_name', 'lc_f_name', 'lc_l_name', 'lc_district', 'lc_state']);
                                                    ret_l.r_obj.verified = true;
                                                    ret_l.r_obj.tint = 'l';
                                                    prelim_objs.push(ret_l);
                                                });
                                                ret_os.forEach(ret_o => {
                                                    ret_o = rank(ret_o, term, ['username', 'lc_name']);
                                                    ret_o.r_obj.verified = ret_o.r_obj.verification.verified;
                                                    ret_o.r_obj.tint = 'o';
                                                    prelim_objs.push(ret_o);
                                                });
                                                ret_us.forEach(ret_u => {
                                                    ret_u = rank(ret_u, term, ['username', 'lc_f_name']);
                                                    ret_u.r_obj.verified = false;
                                                    ret_u.r_obj.tint = 'u';
                                                    prelim_objs.push(ret_u);
                                                });
                                                ret_js.forEach(ret_j => {
                                                    ret_j = rank(ret_j, term, ['lc_f_name', 'lc_l_name', 'username']);
                                                    ret_j.r_obj.tint = 'j';
                                                    prelim_objs.push(ret_j);
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
                                                                    res.redirect('/');
                                                                }
                                                                else {
                                                                    ret_l = strip([ret_l], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                    let tmpMsgs = extractTags(ret_msgs, code);
                                                                    ret_l.messages = extractMentions(tmpMsgs);
                                                                    ret_l.results = results;
                                                                    ret_l.error = error;
                                                                    ret_l.term = init_term;
                                                                    ret_l.tint = 'l';
                                                                    ret_l.accounts = final_objs;
                                                                    ret_l.suggestions = suggestions;
                                                                    res.render('search-res', ret_l);
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
                                                                    res.redirect('/');
                                                                }
                                                                else {
                                                                    let tmpMsgs = extractTags(ret_msgs, username);
                                                                    ret_o.messages = extractMentions(tmpMsgs);
                                                                    ret_o = strip([ret_o], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0];
                                                                    ret_o.results = results;
                                                                    ret_o.error = error;
                                                                    ret_o.term = init_term;
                                                                    ret_o.tint = 'o';
                                                                    ret_o.accounts = final_objs;
                                                                    ret_o.suggestions = suggestions;
                                                                    res.render('search-res', ret_o);
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
                                                                    res.redirect('/');
                                                                }
                                                                else {
                                                                    let tmpMsgs = extractTags(ret_msgs, username);
                                                                    ret_j.messages = extractMentions(tmpMsgs);
                                                                    ret_j = strip([ret_j], ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers'])[0];
                                                                    ret_j.results = results;
                                                                    ret_j.error = error;
                                                                    ret_j.term = init_term;
                                                                    ret_j.tint = 'j';
                                                                    ret_j.accounts = final_objs;
                                                                    ret_j.suggestions = suggestions;
                                                                    res.render('search-res', ret_j);
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
                                                                    res.redirect('/');
                                                                }
                                                                else {
                                                                    let tmpMsgs = extractTags(ret_msgs, null);
                                                                    ret_u.messages = extractMentions(tmpMsgs);
                                                                    ret_u = strip([ret_u], ['password', 'email', 'likes', 'dislikes'])[0];
                                                                    ret_u.results = results;
                                                                    ret_u.error = error;
                                                                    ret_u.term = init_term;
                                                                    ret_u.tint = 'u';
                                                                    ret_u.accounts = final_objs;
                                                                    ret_u.suggestions = suggestions;
                                                                    res.render('search-res', ret_u);
                                                                    let endTime = new Date();
                                                                    log_entry("Search", false, startTime, endTime);
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            let ret_u = {};
                                                            let tmpMsgs = extractTags(ret_msgs, null);
                                                            ret_u.messages = extractMentions(tmpMsgs);
                                                            ret_u.results = results;
                                                            ret_u.error = error;
                                                            ret_u.term = init_term;
                                                            ret_u.tint = 'u';
                                                            ret_u.accounts = final_objs;
                                                            ret_u.suggestions = suggestions;
                                                            res.render('search-res', ret_u);
                                                            let endTime = new Date();
                                                            log_entry("Search", false, startTime, endTime);
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
}

module.exports = search;