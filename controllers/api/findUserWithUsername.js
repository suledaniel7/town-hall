const organisations = require('../schemas/organisations');
const legislators = require('../schemas/legislators');
const journalists = require('../schemas/journalists');
const users = require('../schemas/users');

function findUser(u_type, username) {
    return new Promise((resolve, reject) => {
        if (u_type === 'u') {
            users.findOne({ username: username }, (err, ret_u) => {
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
        else if (u_type === 'o') {
            organisations.findOne({ username: username }, (err, ret_o) => {
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
        else if (u_type === 'j') {
            journalists.findOne({ username: username }, (err, ret_j) => {
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
        else if (u_type === 'l') {
            legislators.findOne({ code: username }, (err, ret_l) => {
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
            resolve(null);
        }
    });
}

module.exports = findUser;