const legislators = require('../schemas/legislators');

function serve(req, res){
    legislators.find().sort({l_name: 1}).exec((err, ret_ls)=>{
        if(err){
            throw err;
        }
        else {
            res.send(JSON.stringify({success: true, legs: ret_ls}));
        }
    });
}

module.exports = serve;