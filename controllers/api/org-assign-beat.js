const districts = require('../schemas/districts');
const journalists = require('../schemas/journalists');
const organisations = require('../schemas/organisations');

function assignBeat(req, res){
    let o_username = req.params.o_username;
    let j_username = req.params.j_username;
    let code = req.params.code;
    
    organisations.findOne({username: o_username}, (err, ret_org)=>{
        if(err){
            throw err;
        }
        else {
            if(!ret_org){
                res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
            }
            else {
                //check j
                journalists.findOne({username: j_username}, (err, ret_j)=>{
                    if(err){
                        throw err;
                    }
                    else {
                        if(!ret_j){
                            res.send(JSON.stringify({success: false, reason: "Invalid Journalist Account"}));
                        }
                        else {
                            districts.findOne({code: code}, (err, ret_dist)=>{
                                if(err){
                                    throw err;
                                }
                                else {
                                    if(!ret_dist){
                                        res.send(JSON.stringify({success: false, reason: "Invalid District"}));
                                    }
                                    else {
                                        //go on. Assign journo, imp in org, also in j. Redirect
                                        ret_j.beat = ret_dist.code;
                                        ret_j.beatName = ret_dist.name;
                                        ret_j.beatDets = {
                                            state: ret_dist.state,
                                            state_code: ret_dist.state_code,
                                            const_num: ret_dist.const_num,
                                            dist_code: ret_dist.dist_code,
                                            type: ret_dist.type,
                                            type_name: ret_dist.type_name,
                                            name: ret_dist.name,
                                            f_name: ret_dist.f_name
                                        }
                                        //remove pending req from org
                                        let num = ret_org.pending_reqs.length;
                                        for(let i=0; i<num; i++){
                                            let current = ret_org.pending_reqs[i];
                                            if(current.username == j_username){
                                                ret_org.pending_reqs.splice(i, 1);
                                                break;
                                            }
                                        }
                                        
                                        //assign district to districts array after checking if it's inside and journo
                                        let flag = false;
                                        ret_org.districts.forEach(dist => {
                                            if(dist == code){
                                                flag = true;
                                            }
                                        });
                                        if(!flag){
                                            ret_org.districts.push(code);
                                        }
                                        ret_org.journalists.push({
                                            username: j_username,
                                            beat: code
                                        });
                                        //change pendingBeat stat
                                        ret_org.pendingBeat = {
                                            status: false,
                                            username: ''
                                        }
                                        ret_org.journo_num++;
                                        //journo inherits followers... nope
                                        
                                        let followersNo = 0;
                                        
                                        ret_j.followersNo = followersNo;

                                        //update both
                                        journalists.findOneAndUpdate({username: j_username}, ret_j, (err)=>{
                                            if(err){
                                                throw err;
                                            }
                                            else {
                                                organisations.findOneAndUpdate({username: o_username}, ret_org, (err)=>{
                                                    if(err){
                                                        throw err;
                                                    }
                                                    else {
                                                        res.send(JSON.stringify({success: true}));
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

module.exports = assignBeat;