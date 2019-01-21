function extractMentions(messages, arr){
    let m_arr = [];
    messages.forEach(ret_m => {
        //identify tags and messily give 'em html
        let mText = ret_m.message;
        let mTextArr = mText.split(/\s/);
        let finalTextArr = [];
        mTextArr.forEach(element => {
            if (element[0] == '@' && element.slice(1).search(/\W/) != 0) {
                let hold_elem = element[0];
                let part_elem = element.slice(1);
                let end = part_elem.search(/\W/);
                let rest_elem = null;
                if (end == -1) {
                    hold_elem = '@' + part_elem;
                }
                else {
                    rest_elem = part_elem.slice(end);
                    part_elem = part_elem.slice(0, end);
                    hold_elem = '@' + part_elem;
                }
                m_arr.push(part_elem);
                if(rest_elem){
                    hold_elem = `<span><a href="/search/people/${part_elem}" class="tag">${hold_elem}</a></span>${rest_elem}`;
                }
                else {
                    hold_elem = `<span><a href="/search/people/${part_elem}" class="tag">${hold_elem}</a></span>`;
                }
                element = hold_elem;
            }
            finalTextArr.push(element);
        });

        ret_m.message = finalTextArr.join(' ');//doesn't use the same char as was used to separate
    });
    if(arr){
        return {
            messages: messages,
            m_arr: m_arr
        }
    }
    else {
        return messages;
    }
}

module.exports = extractMentions;