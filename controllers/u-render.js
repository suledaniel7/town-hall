const users = require('./schemas/users');
const districts = require('./schemas/districts');

function renderProfile(req, res, username) {
    users.findOne({ username: username }, (err, ret_u) => {
        if (err) {
            throw err;
        }
        else if (!ret_u) {
            res.redirect('/');
        }
        else {
            let fed_const = ret_u.fed_const;
            let sen_dist = ret_u.sen_dist;

            districts.findOne({ code: fed_const }, (err, ret_fed) => {
                if (err) {
                    throw err;
                }
                else if (!ret_fed) {
                    console.log(`Significant error in finding Fed Const ${fed_const} for user ${username}`);
                    res.redirect('/');
                }
                else {
                    districts.findOne({ code: sen_dist }, (err, ret_sen) => {
                        if (err) {
                            throw err;
                        }
                        else if (!ret_sen) {
                            console.log(`Significant error in finding Sen Dist ${fed_const} for user ${username}`);
                            res.redirect('/');
                        }
                        else {
                            ret_u.f_c_name = ret_fed.name;
                            ret_u.s_d_name = ret_sen.name;

                            res.render('u-render', ret_u);
                        }
                    });
                }
            });
        }
    });
}

module.exports = renderProfile;