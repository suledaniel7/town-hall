const saveTags = require('./save_tags');
const extractMentions = require('./extractMentions');

function refine(mText, timestamp){
    let wsp = /^\s*$/;
    if (!wsp.test(mText)) {
        //message not-empty. Clear trailing and leading whitespace
        let tsp = /\s+$/;
        let lsp = /^\s+/;

        if (tsp.test(mText)) {
            mText = mText.replace(tsp, '');
        }
        if (lsp.test(mText)) {
            mText = mText.replace(lsp, '');
        }
        //extract tags
        let tags = [];
        let unRefTags = [];
        let mTextArr = mText.split(/\s/);
        //extract based on hashes
        mTextArr.forEach(element => {
            if(element[0] == '#' && element.slice(1).search(/\W/) != 0){
                unRefTags.push(element);
            }
        });
        //extract invalid characters
        unRefTags.forEach(tag => {
            let partTag = tag.slice(1);
            let end = partTag.search(/\W/);
            if (end == -1) {
                tags.push(partTag.toLowerCase());
            }
            else {
                let fin_tag = partTag.slice(0, end);
                tags.push(fin_tag.toLowerCase());
            }
        });

        //extract mentions
        let mentions = extractMentions([{message: mText}], true).m_arr;

        saveTags(tags, timestamp);

        return {
            message: mText,
            mentions: mentions,
            tags: tags
        }
    }
    else {
        return null;
    }
}

module.exports = refine;