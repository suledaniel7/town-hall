const journalists = require('./schemas/journalists');
const messages = require('./schemas/messages');
const beatSelect = require('./select-beat-render');
const orgSelect = require('./select-org-render');

function renderProfile(req, res) {
    let init_user = req.journalist.user;
    let init_username = init_user.username;

    journalists.findOne({ username: init_username }, (err, journalist) => {
        if (err) {
            throw err;
        }
        else {
            if (!journalist) {
                res.redirect('/journalists');
            }
            else {
                //there are different types of j's: freelance, and formal. Freelance need to choose their beats
                //Formal need to choose the organisations they belong to, well, they send requests
                if (journalist.account.type == 'formal') {
                    if (!journalist.account.status) {
                        //un-organised journo
                        orgSelect(req, res);
                    }
                    else {
                        //organised journo
                        let wsp = /^\s*$/;
                        if (!journalist.verified || wsp.test(journalist.beat)) {
                            journalist.free = false;
                        }
                        else {
                            journalist.free = true;
                        }
                        // Compile messages
                        messages.find({ sender: init_username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                ret_msgs.forEach(ret_m => {
                                    ret_m.originator = true;
                                    //identify tags and messily give 'em html
                                    let mText = ret_m.message;
                                    let mTextArr = mText.split(/\s/);
                                    let finalTextArr = [];
                                    mTextArr.forEach(element => {
                                        if (element[0] == '#' && element.slice(1).search(/\W/) != 0) {
                                            let hold_elem = element[0];
                                            let part_elem = element.slice(1);
                                            let end = part_elem.search(/\W/);
                                            if (end == -1) {
                                                hold_elem = '#' + part_elem;
                                            }
                                            else {
                                                hold_elem += part_elem.slice(0, end);
                                            }

                                            hold_elem = `<span><a href="/search/tag/${part_elem}" class="tag">${hold_elem}</a></span>`;
                                            element = hold_elem;
                                        }
                                        finalTextArr.push(element);
                                    });

                                    ret_m.message = finalTextArr.join(' ');
                                });
                                journalist.messages = ret_msgs;
                                res.render('j-profile', journalist);
                            }
                        });
                    }
                }
                else {
                    if (!journalist.account.status) {
                        //un-beat journo
                        beatSelect(req, res);
                    }
                    else {
                        //beat journo
                        journalist.free = true;
                        // Compile messages
                        messages.find({ sender: init_username }).sort({ timestamp: -1 }).exec((err, ret_msgs) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                ret_msgs.forEach(ret_m => {
                                    ret_m.originator = true;
                                    //identify tags and messily give 'em html
                                    let mText = ret_m.message;
                                    let mTextArr = mText.split(/\s/);
                                    let finalTextArr = [];
                                    mTextArr.forEach(element => {
                                        if (element[0] == '#' && element.slice(1).search(/\W/) != 0) {
                                            let hold_elem = element[0];
                                            let part_elem = element.slice(1);
                                            let end = part_elem.search(/\W/);
                                            if (end == -1) {
                                                hold_elem = '#' + part_elem;
                                            }
                                            else {
                                                hold_elem += part_elem.slice(0, end);
                                            }

                                            hold_elem = `<span><a href="/search/tag/${part_elem}" class="tag">${hold_elem}</a></span>`;
                                            element = hold_elem;
                                        }
                                        finalTextArr.push(element);
                                    });

                                    ret_m.message = finalTextArr.join(' ');//doesn't use the same char as was used to separate
                                });
                                journalist.messages = ret_msgs;
                                res.render('j-profile', journalist);
                            }
                        });
                    }
                }
            }
        }
    });
}

module.exports = renderProfile;