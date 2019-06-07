const legislation = require('../schemas/legislation');
const legislators = require('../schemas/legislators');
const findUser = require('./findUser');

function render(req, res) {
    let code = req.params.code;
    findUser(req).then((ret_u) => {
        if (!ret_u) {
            res.send(JSON.stringify({ success: false, reason: "You must be logged in to perform this function" }));
        }
        else {
            let l_code = ret_u.code;
            legislation.findOne({ code: code }, (err, ret_l) => {
                if (err) {
                    res.send(JSON.stringify({ success: false, reason: "An error occured. Please try again later" }));
                    console.log(err);
                }
                else if (!ret_l) {
                    res.send(JSON.stringify({ success: false, reason: "The selected Bill is no longer available" }));
                }
                else {
                    function retrieve(legs) {
                        return new Promise((resolve, reject) => {
                            if (legs) {
                                let fin_legs = [];
                                let final = legs.length - 1;
                                let c_index = -1;
                                for (let i = 0; i < legs.length; i++) {
                                    let c_leg = legs[i];
                                    if(l_code){
                                        if(c_leg === l_code){
                                            c_index = i;
                                        }
                                    }
                                    legislators.findOne({ code: c_leg }, (err, ret_leg) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        else {
                                            ret_leg.password = null;
                                            fin_legs.push(ret_leg);
                                            if (i === final) {
                                                if(l_code){
                                                    if(c_index !== -1){
                                                        fin_legs.splice(c_index, 1);
                                                    }
                                                }
                                                resolve(fin_legs);
                                            }
                                        }
                                    });
                                }
                                if (legs.length === 0) {
                                    resolve([]);
                                }
                            }
                            else {
                                resolve([]);
                            }
                        });
                    }
                    retrieve(ret_l.sponsors).then((sponsors) => {
                        res.send(JSON.stringify({ success: true, bill: ret_l, sponsors: sponsors }));
                    }).catch(e => {
                        res.send(JSON.stringify({ success: false, reason: "An error occured. Please try again later" }));
                        console.log(e);
                    });
                }
            });
        }
    }).catch((e) => {
        res.send(JSON.stringify({ success: false, reason: "An error occured. Please try again later" }));
        console.log(e);
    });
}

module.exports = render;