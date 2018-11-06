const journalists = require('../schemas/journalists');
const districts = require('../schemas/districts');

function selectBeat(req, res){
    let username = req.params.username;
    let beat = req.params.beat;
    
    if(req.journalist){
        if(req.journalist.user && req.journalist.user.username == username){
            //all is well-ish, second parameter of authentication
            journalists.findOne({username: username}, (err, journo)=>{
                if(err){
                    throw err;
                }
                else if(!journo){
                    res.send(JSON.stringify({success: false, reason: "Invalid Account"}));
                }
                else {
                    districts.findOne({ code: beat }, (err, ret_dist) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            if (!ret_dist) {
                                res.send(JSON.stringify({success: false, reason: "Invalid District Selected"}));
                            }
                            else {
                                if (journo.account.type == 'freelance' && journo.beat == '') {
                                    //valid user and request
                                    journo.account.status = true;//assigned to a beat
                                    journo.beat = beat;
                                    journo.beatDets = ret_dist;

                                    //update, and send back to profile controller
                                    journalists.findOneAndUpdate({ username: username }, journo, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            res.send(JSON.stringify({success: true}));
                                        }
                                    });
                                }
                                else {
                                    res.send(JSON.stringify({success: false, reason: "Only Freelance Journalists who have not selected a District may do so"}));
                                }
                            }
                        }
                    });
                }
            });
        }
        else {
            res.send(JSON.stringify({success: false, reason: "Invalid Credentials"}));
        }
    }
    else {
        res.send(JSON.stringify({success: false, reason: "Invalid Credentials"}));
    }
}

module.exports = selectBeat;