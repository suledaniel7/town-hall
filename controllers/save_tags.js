const tags = require('./schemas/tags');

function saveTags(tagArr){
    tagArr.forEach(tag => {
        //extract related
        let related = [];
        tagArr.forEach(rTag => {
            if(tag != rTag){
                related.push(rTag);
            }
        });
        tags.findOne({tag: tag}, (err, ret_t)=> {
            if(err){
                throw err;
            }
            else if(!ret_t){
                //tag doesn't exist... create
                let fin_tag = new tags({
                    tag: tag,
                    mentions: 1,
                    related: related
                });

                fin_tag.save(err => {
                    if(err){
                        throw err;
                    }
                });
            }
            else {
                //tag exists, check related and update
                let rTags = ret_t.related;
                let fin_rs = [];
                related.forEach(relTag => {
                    if(rTags.indexOf(relTag) == -1){
                        //not there
                        fin_rs.push(relTag);
                    }
                });

                fin_rs.forEach(fin_r => {
                    ret_t.related.push(fin_r);
                });

                ret_t.mentions++;

                tags.findOneAndUpdate({tag: tag}, ret_t, (err)=>{
                    if(err){
                        throw err;
                    }
                });
            }
        });
    });
}

module.exports = saveTags;