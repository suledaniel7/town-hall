const tags = require('./schemas/tags');

function serve_trends(req, res){
    tags.find().sort({mentions: -1}).limit(5).exec((err, trends) => {
        if(err){
            throw err;
        }
        else {
            res.send({trends: trends});
        }
    });
}

module.exports = serve_trends;