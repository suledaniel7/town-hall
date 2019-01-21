function extractTags(m_text_div, message_text, tagsNo){
    let flag = true;
    let working_message = message_text;
    let init_position = 0;
    if (working_message.search(/#|@/) == -1) {
        let m_textNode = document.createTextNode(message_text);
        m_text_div.appendChild(m_textNode);
    }
    else {
        while (flag) {
            //identifying pre-tag and appending it
            let tag_start = working_message.search(/#|@/);
            let init_start_position = tag_start + init_position;
            working_message = working_message.slice(tag_start + 1);
            let tag_end = working_message.search(/\W/);
            if (tag_end != 0) {
                if (tag_end == -1) {
                    let init_fragment = message_text.slice(init_position, init_start_position);
                    let initFragmentNode = document.createTextNode(init_fragment);
                    m_text_div.appendChild(initFragmentNode);
                    let tag = message_text.slice(init_start_position);
                    let tagNode = document.createTextNode(tag);
                    let tagSpan = document.createElement('span');
                    let tagA = document.createElement('a');
                    tagA.setAttribute('class', 'tag');
                    if(message_text[init_start_position] == '#'){
                        tagA.setAttribute('href', '/search/tag/'+tag.slice(1));
                    }
                    else {
                        tagA.setAttribute('href', '/search/people/'+tag.slice(1));
                    }
                    tagA.appendChild(tagNode);
                    tagSpan.appendChild(tagA);
                    m_text_div.appendChild(tagSpan);
                    flag = false;
                }
                else {
                    let init_end_position = tag_end + init_start_position + 1;
                    let init_fragment = message_text.slice(init_position, init_start_position);
                    let initFragmentNode = document.createTextNode(init_fragment);
                    m_text_div.appendChild(initFragmentNode);

                    //appending tag
                    let tag = message_text.slice(init_start_position, init_end_position);
                    let tagSpan = document.createElement('span');
                    let tagA = document.createElement('a');
                    tagA.setAttribute('class', 'tag');
                    if(message_text[init_start_position] == '#'){
                        tagA.setAttribute('href', '/search/tag/'+tag.slice(1));
                    }
                    else {
                        tagA.setAttribute('href', '/search/people/'+tag.slice(1));
                    }
                    let tagNode = document.createTextNode(tag);
                    tagA.appendChild(tagNode);
                    tagSpan.appendChild(tagA);
                    m_text_div.appendChild(tagSpan);

                    //appending text post tag
                    working_message = working_message.slice(tag_end);
                    //if there's no other tag
                    if (working_message.search(/#|@/) == -1) {
                        //continues till line end
                        let finalFragmentNode = document.createTextNode(working_message);
                        m_text_div.appendChild(finalFragmentNode);
                        flag = false;
                    }
                    else {
                        init_position = init_end_position;
                    }
                }
            }
        }
    }
}