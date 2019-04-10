const legislation = require('../schemas/legislation');
const findActive = require('./findActive');
const findUser = require('./findUser');

function serve(req, res) {
    let u_type = findActive(req, res);
    if (!u_type) {
        res.send(JSON.stringify({ success: false, reason: "You must be logged in to access this feature" }));
    }
    else {
        findUser(req).then((user) => {
            if (!user) {
                res.send(JSON.stringify({ success: false, reason: "You must be logged in to access this feature" }));
            }
            else {
                let search_arr = [];
                if (u_type === 'user') {
                    search_arr.push({sponsors: user.fed_const}, {sponsors: user.sen_dist});
                    crawl(search_arr);
                }
                else if (u_type === 'journalist') {
                    let wsp = /^\s*$/;
                    if(wsp.test(user.beat)){
                        res.send(JSON.stringify({success: false, reason: 'You must be assigned to a beat to report on Legislation'}));
                    }
                    else {
                        search_arr.push({sponsors: user.beat});
                        crawl(search_arr);
                    }
                }
                else if (u_type === 'legislator') {
                    search_arr.push({sponsors: user.code});
                    crawl(search_arr);
                }
                else {
                    res.send(JSON.stringify({ success: false, reason: "Invalid Request" }));
                }
            }
        }).catch((e) => {
            console.log(e);
            res.send(JSON.stringify({ success: false, reason: "An error occured processing your request. Please try again later" }));
        });
    }
    function crawl(arr) {
        legislation.find({$or: arr}, (err, ret_ls) => {
            if (err) {
                throw err;
            }
            else {
                let l_arr = [];
                let c_arr = [];//completed/inactive legislation
                for(let i=0; i<ret_ls.length; i++){
                    let curr_l = ret_ls[i];
                    if(curr_l.status.active){
                        l_arr.push(curr_l);
                    }
                    else {
                        c_arr.push(curr_l);
                    }
                }
                res.send(JSON.stringify({ success: true, legislation: l_arr, c_legislation: c_arr }));
            }
        });
    }
}

module.exports = serve;