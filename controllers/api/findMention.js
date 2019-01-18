const findType = require('./findType');

function findMention(req, res){
    let username = req.body.username;
    findType(username).then((u_type)=>{
        if(u_type){
            res.send({found: true});
        }
        else {
            res.send({found: false});
        }
    }).catch((err)=>{
        res.send({found: false, reason: err});
    });
}

module.exports = findMention;