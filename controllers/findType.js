const general = require('./schemas/general');
const legislators = require('./schemas/legislators');
const organisations = require('./schemas/organisations');
const journalists = require('./schemas/journalists');
const users = require('./schemas/users');

function findType(username) {
    return new Promise((resolve, reject) => {
        general.findOne({ username: username }, (err, ret_g) => {
            if (err) {
                reject(err);
            }
            else if (!ret_g) {
                resolve(null);
            }
            else {
                let identifier = ret_g.identifier;
                if (identifier == 'o') {
                    organisations.findOne({ username: username }, (err, ret_o) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!ret_o) {
                            resolve(null);
                        }
                        else {
                            resolve('organisation');
                        }
                    });
                }
                else if (identifier == 'j') {
                    journalists.findOne({ username: username }, (err, ret_j) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!ret_j) {
                            resolve(null);
                        }
                        else {
                            resolve('journalist');
                        }
                    });
                }
                else if(identifier == 'l'){
                    legislators.findOne({ code: username }, (err, ret_l) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!ret_l) {
                            resolve(null);
                        }
                        else {
                            resolve('legislator');
                        }
                    });
                }
                else if (identifier == 'u') {
                    users.findOne({ username: username }, (err, ret_u) => {
                        if (err) {
                            reject(err);
                        }
                        else if (!ret_u) {
                            resolve(null);
                        }
                        else {
                            resolve('user');
                        }
                    });
                }
                else {
                    resolve(null);
                }
            }
        });
    });

}

module.exports = findType;