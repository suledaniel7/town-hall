const messages = require('./schemas/messages');
const legislators = require('./schemas/legislators');
const organisations = require('./schemas/organisations');
const journalists = require('./schemas/journalists');
const tags = require('./schemas/tags');
const users = require('./schemas/users');
const extractTags = require('./extractTags');
const findActive = require('./findActive');
const rank = require('./rank');
const sort_rank = require('./sort_rank');
const strip = require('./strip');

function search(req, res) {
    let type = req.params.type;
    let init_term = req.params.term;
    let user = findActive(req, res);

    if (type == 'tag') {
        let term = RegExp(init_term.toLowerCase());
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
                            ret_l.messages = extractTags(ret_msgs, code);
                            if (ret_l.messages.length > 0) {
                                ret_l.results = true;
                            }
                            else {
                                ret_l.error = "No messages were found containing that tag";
                            }
                            ret_l.term = '#' + init_term;
                            ret_l.tint = 'l';
                            res.render('search-res', ret_l);
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
                            ret_o.messages = extractTags(ret_msgs, username);
                            if (ret_o.messages.length > 0) {
                                ret_o.results = true;
                            }
                            else {
                                ret_o.error = "No messages were found containing that tag";
                            }
                            ret_o.term = '#' + init_term;
                            ret_o.tint = 'o';
                            res.render('search-res', ret_o);
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
                            ret_j.messages = extractTags(ret_msgs, username);
                            if (ret_j.messages.length > 0) {
                                ret_j.results = true;
                            }
                            else {
                                ret_j.error = "No messages were found containing that tag";
                            }
                            ret_j.term = '#' + init_term;
                            ret_j.tint = 'j';
                            res.render('search-res', ret_j);
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
                            ret_u.messages = extractTags(ret_msgs, null);
                            if (ret_u.messages.length > 0) {
                                ret_u.results = true;
                            }
                            else {
                                ret_u.error = "No messages were found containing that tag";
                            }
                            ret_u.term = '#' + init_term;
                            ret_u.tint = 'u';
                            res.render('search-res', ret_u);
                        }
                    });
                }
                else {
                    let ret_u = {};
                    ret_u.messages = extractTags(ret_msgs, null);
                    if (ret_u.messages.length > 0) {
                        ret_u.results = true;
                    }
                    else {
                        ret_u.error = "No messages were found containing that tag";
                    }
                    ret_u.term = '#' + init_term;
                    ret_u.tint = 'u';
                    res.render('search-res', ret_u);
                }
            }
        });
    }
    else if (type == 'people') {
        let term = RegExp(init_term.toLowerCase());
        legislators.find({ $or: [{ lc_name: term }, { lc_f_name: term }, { lc_l_name: term }, { lc_district: term }, { lc_state: term }] }, (err, ret_ls) => {
            if (err) {
                throw err;
            }
            else {
                journalists.find({ $or: [{ lc_f_name: term }, { lc_l_name: term }, { username: term }] }, (err, ret_js) => {
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
                                ret_os = strip(ret_os, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes']);

                                //rank results
                                let prelim_objs = [];
                                ret_ls.forEach(ret_l => {
                                    prelim_objs.push(rank(ret_l, term, ['lc_name', 'lc_f_name', 'lc_l_name', 'lc_district', 'lc_state']));
                                });
                                ret_js.forEach(ret_j => {
                                    prelim_objs.push(rank(ret_j, term, ['lc_f_name', 'lc_l_name', 'username']));
                                });
                                ret_os.forEach(ret_o => {
                                    prelim_objs.push(rank(ret_o, term, ['username', 'lc_name']));
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
                                            res.render('search-res', ret_u);
                                        }
                                    })
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
                                            res.render('search-res', ret_l);
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
                                            res.render('search-res', ret_o);
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
                                            res.render('search-res', ret_j);
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
                                    res.render('search-res', ret_u);
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        //general search
        let term = RegExp(init_term.toLowerCase());
        legislators.find({ $or: [{ lc_name: term }, { lc_f_name: term }, { lc_l_name: term }, { lc_district: term }, { lc_state: term }] }, (err, ret_ls) => {
            if (err) {
                throw err;
            }
            else {
                journalists.find({ $or: [{ lc_f_name: term }, { lc_l_name: term }, { username: term }] }, (err, ret_js) => {
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
                                ret_os = strip(ret_os, ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes']);
                                //rank results
                                let prelim_objs = [];
                                ret_ls.forEach(ret_l => {
                                    ret_l = rank(ret_l, term, ['lc_name', 'lc_f_name', 'lc_l_name', 'lc_district', 'lc_state']);
                                    ret_l.r_obj.tint = 'l';
                                    prelim_objs.push(ret_l);
                                });
                                ret_js.forEach(ret_j => {
                                    ret_j = rank(ret_j, term, ['lc_f_name', 'lc_l_name', 'username']);
                                    ret_j.r_obj.tint = 'j';
                                    prelim_objs.push(ret_j);
                                });
                                ret_os.forEach(ret_o => {
                                    ret_o = rank(ret_o, term, ['username', 'lc_name']);
                                    ret_o.r_obj.tint = 'o';
                                    prelim_objs.push(ret_o);
                                });

                                final_objs = sort_rank(prelim_objs);

                                //getting messages
                                messages.find({$or: [{ tags: term }, {message: term}]}).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
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
                                                    ret_l.messages = extractTags(ret_msgs, code);
                                                    ret_l.results = results;
                                                    ret_l.error = error;
                                                    ret_l.term = init_term;
                                                    ret_l.tint = 'l';
                                                    ret_l.accounts = final_objs;
                                                    res.render('search-res', ret_l);
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
                                                    ret_o.messages = extractTags(ret_msgs, username);
                                                    ret_o = strip([ret_o], ['email', 'pub_email', 'password', 'pendingBeat', 'districts', 'journalists', 'pending_reqs', 'followers', 'likes', 'dislikes'])[0];
                                                    ret_o.results = results;
                                                    ret_o.error = error;
                                                    ret_o.term = init_term;
                                                    ret_o.tint = 'o';
                                                    ret_o.accounts = final_objs;
                                                    res.render('search-res', ret_o);
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
                                                    ret_j.messages = extractTags(ret_msgs, username);
                                                    ret_j = strip([ret_j], ['email', 'password', 'account', 'orientation', 'rejected', 'likes', 'dislikes', 'followers'])[0];
                                                    ret_j.results = results;
                                                    ret_j.error = error;
                                                    ret_j.term = init_term;
                                                    ret_j.tint = 'j';
                                                    ret_j.accounts = final_objs;
                                                    res.render('search-res', ret_j);
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
                                                    ret_u.messages = extractTags(ret_msgs, null);
                                                    ret_u = strip([ret_u], ['password', 'email', 'likes', 'dislikes'])[0];
                                                    ret_u.results = results;
                                                    ret_u.error = error;
                                                    ret_u.term = init_term;
                                                    ret_u.tint = 'u';
                                                    ret_u.accounts = final_objs;
                                                    res.render('search-res', ret_u);
                                                }
                                            });
                                        }
                                        else {
                                            let ret_u = {};
                                            ret_u.messages = extractTags(ret_msgs, null);
                                            ret_u.results = results;
                                            ret_u.error = error;
                                            ret_u.term = init_term;
                                            ret_u.tint = 'u';
                                            ret_u.accounts = final_objs;
                                            res.render('search-res', ret_u);
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
    //otherwise user.accounts is true
}
module.exports = search;