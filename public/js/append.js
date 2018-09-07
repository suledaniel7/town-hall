function appendMessage(message, originator) {
    let message_text = message.message;
    let timeStamp = message.time_created;
    let dateStamp = message.date_created;

    //create text div
    let m_text = document.createElement('div');
    m_text.setAttribute('class', 'm-text');

    //working on message text
    let working_message = message_text;
    let tagsNo = message.tags.length;
    let init_position = 0;

    if (tagsNo == 0) {
        let m_textNode = document.createTextNode(message_text);
        m_text.appendChild(m_textNode);
    }
    else {
        for (let i = 0; i < tagsNo; i++) {
            //identifying pre-tag and appending it
            let tag_start = working_message.search(/#/);
            let init_start_position = tag_start + init_position;
            working_message = working_message.slice(tag_start + 1);
            let tag_end = working_message.search(/\W/);
            if (tag_end != 0) {
                if (tag_end == -1) {
                    let init_fragment = message_text.slice(init_position, init_start_position);
                    let initFragmentNode = document.createTextNode(init_fragment);
                    m_text.appendChild(initFragmentNode);
                    let tag = message_text.slice(init_start_position);
                    let tagNode = document.createTextNode(tag);
                    let tagSpan = document.createElement('span');
                    let tagA = document.createElement('a');
                    tagA.setAttribute('class', 'tag');
                    tagA.setAttribute('href', '/search/tag/'+tag.slice(1));
                    tagA.appendChild(tagNode);
                    tagSpan.appendChild(tagA);
                    m_text.appendChild(tagSpan);
                }
                else {
                    let init_end_position = tag_end + init_start_position + 1;
                    let init_fragment = message_text.slice(init_position, init_start_position);
                    let initFragmentNode = document.createTextNode(init_fragment);
                    m_text.appendChild(initFragmentNode);

                    //appending tag
                    let tag = message_text.slice(init_start_position, init_end_position);
                    let tagSpan = document.createElement('span');
                    let tagA = document.createElement('a');
                    tagA.setAttribute('class', 'tag');
                    tagA.setAttribute('href', '/search/tag/'+tag.slice(1));
                    let tagNode = document.createTextNode(tag);
                    tagA.appendChild(tagNode);
                    tagSpan.appendChild(tagA);
                    m_text.appendChild(tagSpan);

                    //appending text post tag
                    working_message = working_message.slice(tag_end);
                    //if there's no other tag
                    if (working_message.search(/#/) == -1) {
                        //continues till line end
                        let finalFragmentNode = document.createTextNode(working_message);
                        m_text.appendChild(finalFragmentNode);
                    }
                    else {
                        init_position = init_end_position;
                    }
                }
            }

            //for final tag


        }
    }


    //create entire message div
    let newMessage = document.createElement('div');
    newMessage.setAttribute('class', 'message');

    //create user avatar div
    let m_avatar = document.createElement('div');
    m_avatar.setAttribute('class', 'm-avatar');

    //create avatar image
    let m_avatar_img = document.createElement('img');
    m_avatar_img.setAttribute('src', '/' + message.sender_avatar);
    m_avatar_img.setAttribute('class', 'm-avatar-img');
    m_avatar_img.setAttribute('alt', message.sender_name + '\'s avatar');

    //create sender info div
    let m_sender = document.createElement('div');
    m_sender.setAttribute('class', 'm-sender');

    //create sender info child elements
    let m_sender_l1 = document.createElement('div');
    m_sender_l1.setAttribute('class', 'm-sender-line');
    let m_sender_l1_a = document.createElement('a');
    m_sender_l1_a.setAttribute('href', '/users/' + message.sender);
    if (message.verified) {
        var m_sender_l1_s = document.createElement('span');
        m_sender_l1_s.setAttribute('class', 'verified');
        var m_sender_l1_i = document.createElement('img');
        m_sender_l1_i.setAttribute('src', '/img/img-1/success.png');
        m_sender_l1_i.setAttribute('title', 'Verified User');
        m_sender_l1_i.setAttribute('alt', 'Verified User');
    }
    if (message.sender_position) {
        var m_sender_l2 = document.createElement('div');
        m_sender_l2.setAttribute('class', 'm-sender-line');
    }


    //create message info div
    let m_info = document.createElement('div');
    m_info.setAttribute('class', 'm-info center');
    let m_item_img1 = document.createElement('img');
    m_item_img1.setAttribute('src', '/img/png/chat-1.png');
    m_item_img1.setAttribute('class', 'item');
    m_item_img1.setAttribute('title', 'Conversation');
    m_item_img1.setAttribute('alt', 'Conversation');
    if (originator) {
        var m_item_img2 = document.createElement('img');
        m_item_img2.setAttribute('src', '/img/png/edit.png');
        m_item_img2.setAttribute('class', 'item');
        m_item_img2.setAttribute('title', 'Edit');
        m_item_img2.setAttribute('alt', 'Edit');

        var m_item_img4 = document.createElement('img');
        m_item_img4.setAttribute('src', '/img/png/garbage.png');
        m_item_img4.setAttribute('class', 'item');
        m_item_img4.setAttribute('title', 'Delete');
        m_item_img4.setAttribute('alt', 'Delete');
    }
    else {
        var m_item_img3 = document.createElement('img');
        m_item_img3.setAttribute('src', '/img/img-1/flag.png');
        m_item_img3.setAttribute('class', 'item');
        m_item_img3.setAttribute('title', 'Report');
        m_item_img3.setAttribute('alt', 'Report');
    }
    let m_item_span = document.createElement('span');
    m_item_span.setAttribute('class', 'item grey');

    //create text nodes
    if (originator) {
        var m_sender_text = document.createTextNode("You");
    }
    else {
        var m_sender_text = document.createTextNode(message.sender_name);
    }
    if (message.sender_position) {
        var m_sender_p_text = document.createTextNode(message.sender_position);
    }
    // let m_textNode = document.createTextNode(message_text);
    let convo_num = document.createTextNode("(" + message.comments_no + ")");
    let t_textNode = document.createTextNode(timeStamp + ' | ' + dateStamp);

    //appending avatar to div
    m_avatar.appendChild(m_avatar_img);

    //appending sender info to div
    m_sender_l1_a.appendChild(m_sender_text);
    m_sender_l1.appendChild(m_sender_l1_a);
    if (message.verified) {
        m_sender_l1_s.appendChild(m_sender_l1_i);
        m_sender_l1.appendChild(m_sender_l1_s);
    }
    m_sender.appendChild(m_sender_l1);
    if (message.sender_position) {
        m_sender_l2.appendChild(m_sender_p_text);
        m_sender.appendChild(m_sender_l2);
    }

    // //appending message to div
    // m_text.appendChild(m_textNode);

    //appending message info to div
    m_info.appendChild(m_item_img1);
    m_info.appendChild(convo_num);

    if (originator) {
        m_info.appendChild(m_item_img2);
        m_info.appendChild(m_item_img4);
    }
    else {
        m_info.appendChild(m_item_img3);
    }
    m_item_span.appendChild(t_textNode);
    m_info.appendChild(m_item_span);

    //appending four inner divs to message
    newMessage.appendChild(m_avatar);
    newMessage.appendChild(m_sender);
    newMessage.appendChild(m_text);
    newMessage.appendChild(m_info);

    let messagesDiv = document.getElementById('messagesDiv');
    let first = messagesDiv.firstChild;
    messagesDiv.insertBefore(newMessage, first);
}