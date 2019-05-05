const legislation = require('../schemas/legislation');

function render(req, res){
    let code = req.body.code;

    legislation.findOne({code: code}, (err, ret_leg)=>{
        if(err){
            throw err;
        }
        else if(!ret_leg){
            res.send(JSON.stringify({success: false, reason: "Invalid Legislation"}));
        }
        else {
            res.send(JSON.stringify({success: true, leg: ret_leg}));
        }
    });
}

module.exports = render;