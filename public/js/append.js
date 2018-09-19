function appendMessage(message, originator, loc) {
    let message_text = message.message;
    let m_timestamp = message.m_timestamp;
    let timeStamp = message.time_created;
    let dateStamp = message.date_created;

    //create text div
    let m_text = document.createElement('div');
    m_text.setAttribute('class', 'm-text');

    //working on message text
    let tagsNo = message.tags.length;

    extractTags(m_text, message_text, tagsNo);


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
    //out of sync creation of convo num span
    let convo_num_span = document.createElement('span');
    convo_num_span.setAttribute('id', `comm-num-${m_timestamp}`);

    //create message info div
    let m_info = document.createElement('div');
    m_info.setAttribute('class', 'm-info center');
    let m_item_img1 = document.createElement('img');
    m_item_img1.setAttribute('src', '/img/png/chat-1.png');
    m_item_img1.setAttribute('onclick', `conversation('${m_timestamp}')`);
    m_item_img1.setAttribute('uk-toggle', 'target: #converse');
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
    let convo_num_node = document.createTextNode(' ' + message.comments_no);
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
    convo_num_span.appendChild(convo_num_node);
    m_info.appendChild(convo_num_span);

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

    if(!loc){
        loc = 'messagesDiv';
    }
    let messagesDiv = document.getElementById(loc);
    let first = messagesDiv.firstChild;
    messagesDiv.insertBefore(newMessage, first);
}