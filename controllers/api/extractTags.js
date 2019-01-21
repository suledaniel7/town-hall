function extractTags(messages, username){
    messages.forEach(ret_m => {
        if(username && ret_m.sender == username){
            ret_m.originator = true;
        }
        else {
            ret_m.originator = false;
        }
        //identify tags and messily give 'em html
        let mText = ret_m.message;
        let t = 'm';
        if(!mText){
            t = 'c';
            mText = ret_m.comment;
        }
        let mTextArr = mText.split(/\s/);
        let finalTextArr = [];
        mTextArr.forEach(element => {
            if (element[0] == '#' && element.slice(1).search(/\W/) != 0) {
                let hold_elem = element[0];
                let part_elem = element.slice(1);
                let end = part_elem.search(/\W/);
                if (end == -1) {
                    hold_elem = '#' + part_elem;
                }
                else {
                    hold_elem += part_elem.slice(0, end);
                }

                hold_elem = `<a class="tag" href="javascript:render_tag('${part_elem}')">${hold_elem}</a>`;
                element = hold_elem;
            }
            finalTextArr.push(element);
        });

        //doesn't use the same char as was used to separate
        if(t == 'm'){
            ret_m.message = finalTextArr.join(' ');
        }
        else {
            ret_m.comment = finalTextArr.join(' ');
        }
    });
    return messages;
}

module.exports = extractTags;