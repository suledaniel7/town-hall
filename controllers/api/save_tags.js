const tags = require('../schemas/tags');

function saveTags(tagArr, m_timestamp){
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
                    messages: [m_timestamp],
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

                //increment mentions only if tag is appearing for the first time in a given message
                if(ret_t.messages.indexOf(m_timestamp) == -1){
                    ret_t.messages.push(m_timestamp);
                    ret_t.mentions++;
                }

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