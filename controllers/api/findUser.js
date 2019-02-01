const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const journalists = require('../schemas/journalists');
const users = require('../schemas/users');

//warning. This could make the program hang indefinitely if there is no active user
//we cannot include an else anywhere because all code runs and the code works this way to ensure everywhere is checked
//oh, yeah. They're also all async so...

function findUser(req) {
    let checked = 0;
    let reached = 0;

    return new Promise((resolve, reject) => {
        if (req.user) {
            reached++;
            if (req.user.user) {
                let username = req.user.user.username;
                users.findOne({ username: username }, (err, ret_u) => {
                    checked++;
                    if (err) {
                        reject(err);
                    }
                    else if (!ret_u) {
                        resolve(null);
                    }
                    else {
                        resolve(ret_u);
                    }
                });
            }
            else {
                checked++;
                checker();
            }
        }
        else {
            reached++;
            reacher();
        }
        if (req.organisation) {
            reached++;
            if (req.organisation.user) {
                let username = req.organisation.user.username;
                organisations.findOne({ username: username }, (err, ret_o) => {
                    checked++;
                    if (err) {
                        reject(err);
                    }
                    else if (!ret_o) {
                        resolve(null);
                    }
                    else {
                        resolve(ret_o);
                    }
                });
            }
            else {
                checked++;
                checker();
            }
        }
        else {
            reached++;
            reacher();
        }
        if (req.journalist) {
            reached++;
            if (req.journalist.user) {
                let username = req.journalist.user.username;
                journalists.findOne({ username: username }, (err, ret_j) => {
                    checked++;
                    if (err) {
                        reject(err);
                    }
                    else if (!ret_j) {
                        resolve(null);
                    }
                    else {
                        resolve(ret_j);
                    }
                });
            }
            else {
                checked++;
                checker();
            }
        }
        else {
            reached++;
            reacher();
        }
        if (req.legislator) {
            reached++;
            if (req.legislator.user) {
                let code = req.legislator.user.code;
                legislators.findOne({ code: code }, (err, ret_l) => {
                    checked++;
                    if (err) {
                        reject(err);
                    }
                    else if (!ret_l) {
                        resolve(null);
                    }
                    else {
                        resolve(ret_l);
                    }
                });
            }
            else {
                checked++;
                checker();
            }
        }
        else {
            reached++;
            reacher();
        }

        function reacher() {
            if (reached === 4) {
                resolve(null);
            }
        }

        function checker() {
            if (checked === 4) {
                resolve(null);
            }
        }
    });
}

module.exports = findUser;