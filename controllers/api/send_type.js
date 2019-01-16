const findType = require('./findType');

function sendType(req, res){
    let username = req.params.username;

    async function seek(username){
        let resp = await findType(username);
        if(resp == 'user'){
            resp = 'u';
        }
        else if(resp == 'organisation'){
            resp = 'o';
        }
        else if(resp == 'journalist'){
            resp = 'j';
        }
        else if(resp == 'legislator'){
            resp = 'l';
        }
        res.send({success: true, u_type: resp});
    }

    seek(username);
}

module.exports = sendType;