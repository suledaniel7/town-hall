const tags = require('../schemas/tags');

function serve_trends(req, res){
    tags.find().sort({mentions: -1}).limit(5).exec((err, trends) => {
        if(err){
            throw err;
        }
        else {
            let fin_trends = [];
            for(let i=0; i<trends.length; i++){
                let n_trend = {
                    tag: trends[i].tag,
                    mentions: trends[i].mentions
                }
                let num = trends[i].mentions;
                if(num > 1){
                    n_trend.people = "people";
                }
                else {
                    n_trend.people = "person";
                }
                fin_trends.push(n_trend);
            }
            res.send(JSON.stringify({success: true, trends: fin_trends}));
        }
    });
}

module.exports = serve_trends;