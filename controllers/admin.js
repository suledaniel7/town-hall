const legis = require('./schemas/legislators');
const dists = require('./schemas/districts');
const states = require('./schemas/states');
const hash = require('password-hash');

function admin(req, res) {
    let { f_name, l_name, type, gender, state, s_code, district, d_code } = req.body;
    //default avatar
    s_code = s_code.toLowerCase();
    d_code = d_code.toLowerCase();
    let code = s_code + '_' + type + '_' + d_code;
    let email = code + '@nass.gov';
    email = email.toLowerCase();
    if (gender == 'f') {
        var avatar = 'img/png/avatar-1.png';
    }
    else {
        var avatar = 'img/png/avatar.png';
    }
    let name = f_name.toLowerCase() + ' ' + l_name.toLowerCase();
    let password = hash.generate('pass', { algorithm: 'sha256' });
    let full_name = f_name + ' ' + l_name;
    //done with legislators.js

    let type_name = '';
    if(type == 'sen'){
        type_name = "Senatorial District";
    }
    else {
        type_name = "Federal Constituency";
    }

    let st_f_name = state.toLowerCase();
    //searching for whether the state exists
    legis.findOne({ email: email }, (err, f_leg) => {
        if (err) {
            throw err;
        }
        else if (f_leg) {
            setNotif('Error: Email address already in use. Choose another');
            res.redirect('/admin');
        }
        else {
            states.findOne({ state_code: s_code }, (err, ret_state) => {
                if (err) {
                    console.error("Error finding state with code: " + s_code);
                    throw err;
                }
                else if (ret_state === null) {
                    //state doesn't exist. Districts also cannot exist
                    //check for the district type and create appropriate array
                    let type_exp = '';
                    if (type == 'sen') {
                        //senatorial district
                        type_exp = 'Sen.';
                        let lc_district = district.toLowerCase();
                        var newDist = new dists({
                            name: district,
                            f_name: lc_district,
                            type: type,
                            type_name: type_name,
                            state_code: s_code,
                            state: state,
                            const_num: 0,
                            rep: full_name,
                            dist_code: d_code,
                            code: code
                        });
                        // console.log("New District:");
                        // console.log('-------------------------------');
                        // console.log(newDist);

                        let sen_dist = [code];
                        //if our trial doesn't work, we'll have to inc rep dists array, and eliminate this whole if else block
                        //now create state here and below.

                        var newSt = new states({
                            name: state,
                            f_name: st_f_name,
                            sen_dists: sen_dist,
                            state_code: s_code
                        });

                        // console.log("New State:");
                        // console.log('-------------------------------');
                        // console.log(newSt);
                    }
                    else {
                        //rep district
                        type_exp = 'Rep.';
                        let lc_district = district.toLowerCase();
                        var newDist = new dists({
                            name: district,
                            f_name: lc_district,
                            type: type,
                            type_name: type_name,
                            state_code: s_code,
                            state: state,
                            const_num: 0,
                            rep: full_name,
                            dist_code: d_code,
                            code: code
                        });
                        // console.log("New District:");
                        // console.log('-------------------------------');
                        // console.log(newDist);

                        let rep_dist = [code];

                        var newSt = new states({
                            name: state,
                            f_name: state.toLowerCase(),
                            rep_dists: rep_dist,
                            state_code: s_code
                        });

                        // console.log("New State:");
                        // console.log('-------------------------------');
                        // console.log(newSt);
                    }
                    var newLeg = new legis({
                        lc_name: name,
                        email: email,
                        password: password,
                        f_name: f_name,
                        lc_f_name: f_name.toLowerCase(),
                        l_name: l_name,
                        lc_l_name: l_name.toLowerCase(),
                        full_name: full_name,
                        district: district,
                        lc_district: district.toLowerCase(),
                        district_code: d_code,
                        type: type,
                        type_exp: type_exp,
                        const_num: 0,
                        state: state,
                        lc_state: state.toLowerCase(),
                        state_code: s_code,
                        messages_no: 0,
                        bio: '',
                        gender: gender,
                        code: code,
                        avatar: avatar
                    });
                    // console.log("New Legislator:");
                    // console.log('-------------------------------');
                    // console.log(newLeg);

                    //save 'em all: state, dist, legis in order
                    newSt.save((err) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            newDist.save((err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    newLeg.save((err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            // res.render('admin', { notif: "State, district and legislator added successfully" });
                                            setNotif("State, district and legislator added successfully");
                                            res.redirect('/admin');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    //state exists, check whether district exists
                    let ret_sen_dists = ret_state.sen_dists;
                    let ret_rep_dists = ret_state.rep_dists;

                    if (type == 'sen') {
                        //senatorial district
                        //check whether district exists
                        if (ret_sen_dists.indexOf(d_code) !== -1) {
                            //district exists, change name
                            const newLeg = {
                                lc_name: name,
                                email: email,
                                password: password,
                                f_name: f_name,
                                lc_f_name: f_name.toLowerCase(),
                                l_name: l_name,
                                lc_l_name: l_name.toLowerCase(),
                                full_name: full_name,
                                district: district,
                                lc_district: district.toLowerCase(),
                                district_code: d_code,
                                type: type,
                                state: state,
                                const_num: 0,
                                lc_state: state.toLowerCase(),
                                state_code: s_code,
                                messages_no: 0,
                                bio: '',
                                gender: gender,
                                code: code,
                                avatar: avatar
                            };
                            let lc_district = district.toLowerCase();
                            const newDist = {
                                name: district,
                                f_name: lc_district,
                                type: type,
                                type_name: type_name,
                                state_code: s_code,
                                state: state,
                                const_num: 0,
                                rep: full_name,
                                dist_code: d_code,
                                code: code
                            };

                            legis.findOneAndUpdate({ code: code }, newLeg, (err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    //now update district
                                    dists.findOneAndUpdate({ code: code }, newDist, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            //redirect
                                            // res.render('admin', { notif: 'Updated Legislator and District to reflect new name' });
                                            setNotif('Updated Legislator and District to reflect new name');
                                            res.redirect('/admin');
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            //district doesn't exist
                            //create, w/legis
                            let lc_district = district.toLowerCase();
                            const newDist = new dists({
                                name: district,
                                f_name: lc_district,
                                type: type,
                                type_name: type_name,
                                state_code: s_code,
                                state: state,
                                const_num: 0,
                                rep: full_name,
                                dist_code: d_code,
                                code: code
                            });

                            const newLeg = new legis({
                                lc_name: name,
                                email: email,
                                password: password,
                                f_name: f_name,
                                lc_f_name: f_name.toLowerCase(),
                                l_name: l_name,
                                lc_l_name: l_name.toLowerCase(),
                                full_name: full_name,
                                district: district,
                                lc_district: district.toLowerCase(),
                                district_code: d_code,
                                type: type,
                                type_exp: 'Sen.',
                                state: state,
                                const_num: 0,
                                lc_state: state.toLowerCase(),
                                state_code: s_code,
                                messages_no: 0,
                                bio: '',
                                gender: gender,
                                code: code,
                                avatar: avatar
                            });

                            //save em both: dist, legis io
                            newDist.save((err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    newLeg.save((err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            //effect district change on state
                                            ret_sen_dists[ret_sen_dists.length] = code;
                                            states.findOneAndUpdate({ state_code: s_code }, { sen_dists: ret_sen_dists }, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    // res.render('admin', { notif: "District and legislator added successfully" });
                                                    setNotif("District and legislator added successfully");
                                                    res.redirect('/admin');
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                    else {
                        //rep district
                        //check whether district exists
                        if (ret_rep_dists.indexOf(d_code) !== -1) {
                            //district exists, change name
                            const newLeg = {
                                lc_name: name,
                                email: email,
                                password: password,
                                f_name: f_name,
                                lc_f_name: f_name.toLowerCase(),
                                l_name: l_name,
                                lc_l_name: l_name.toLowerCase(),
                                full_name: full_name,
                                district: district,
                                lc_district: district.toLowerCase(),
                                district_code: d_code,
                                type: type,
                                state: state,
                                const_num: 0,
                                lc_state: state.toLowerCase(),
                                state_code: s_code,
                                messages_no: 0,
                                bio: '',
                                gender: gender,
                                code: code,
                                avatar: avatar
                            };

                            let lc_district = district.toLowerCase();
                            const newDist = {
                                name: district,
                                f_name: lc_district,
                                type: type,
                                type_name: type_name,
                                state_code: s_code,
                                state: state,
                                const_num: 0,
                                rep: full_name,
                                dist_code: d_code,
                                code: code
                            };

                            legis.findOneAndUpdate({ code: code }, newLeg, (err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    //now update district
                                    dists.findOneAndUpdate({ code: code }, newDist, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            //redirect
                                            // res.render('admin', { notif: 'Updated Legislator and District to reflect new name' });
                                            setNotif('Updated Legislator and District to reflect new name');
                                            res.redirect('/admin');
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            //district doesn't exist
                            //create, w/legis
                            let lc_district = district.toLowerCase();
                            const newDist = new dists({
                                name: district,
                                f_name: lc_district,
                                type: type,
                                type_name: type_name,
                                state_code: s_code,
                                state: state,
                                const_num: 0,
                                rep: full_name,
                                dist_code: d_code,
                                code: code
                            });

                            const newLeg = new legis({
                                lc_name: name,
                                email: email,
                                password: password,
                                f_name: f_name,
                                lc_f_name: f_name.toLowerCase(),
                                l_name: l_name,
                                lc_l_name: l_name.toLowerCase(),
                                full_name: full_name,
                                district: district,
                                lc_district: district.toLowerCase(),
                                district_code: d_code,
                                type: type,
                                type_exp: 'Rep.',
                                state: state,
                                const_num: 0,
                                lc_state: state.toLowerCase(),
                                state_code: s_code,
                                messages_no: 0,
                                bio: '',
                                gender: gender,
                                code: code,
                                avatar: avatar
                            });

                            //save em both: dist, legis io
                            newDist.save((err) => {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    newLeg.save((err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            //effect district change on state
                                            ret_rep_dists[ret_rep_dists.length] = code;
                                            states.findOneAndUpdate({ state_code: s_code }, { rep_dists: ret_rep_dists }, (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    // res.render('admin', { notif: "District and legislator added successfully" });
                                                    setNotif("District and legislator added successfully");
                                                    res.redirect('/admin');
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            });
        }
    });

    function setNotif(notification) {
        req.notifications = { notification: notification };
    }
}

module.exports = admin;