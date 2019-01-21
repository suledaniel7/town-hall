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

                hold_elem = `<span><a href="/search/tag/${part_elem}" class="tag">${hold_elem}</a></span>`;
                element = hold_elem;
            }
            finalTextArr.push(element);
        });

        ret_m.message = finalTextArr.join(' ');//doesn't use the same char as was used to separate
    });
    return messages;
}

module.exports = extractTags;