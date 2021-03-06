function appendMessage(message, originator, loc) {
    let message_text = message.message;
    let m_timestamp = message.m_timestamp;
    let timeStamp = message.time_created;
    let dateStamp = message.date_created;


    //create table for text
    let m_table = document.createElement('table');
    let m_tr = document.createElement('tr');
    let m_td = document.createElement('td');
    m_td.setAttribute('class', 'mTextTD');

    //create text div
    let m_text = document.createElement('div');
    m_text.setAttribute('class', 'm-text');
    m_text.setAttribute('id', `m-text-${m_timestamp}`);

    //working on message text
    let tagsNo = message.tags.length;

    extractTags(m_text, message_text, tagsNo);


    //create entire message div
    let newMessage = document.createElement('div');
    newMessage.setAttribute('class', 'message uk-width-1-1 uk-card uk-card-default  uk-card-hover uk-card-body');
    newMessage.setAttribute('id', m_timestamp);

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
    m_info.setAttribute('class', 'm-info');
    let m_info_table = document.createElement('table');
    let m_info_tr = document.createElement('tr');

    if (originator) {
        let m_item_td1 = document.createElement('td');
        m_item_td1.setAttribute('class', 'uk-width-1-4 center uk-visible@m');
        let m_item_td2 = document.createElement('td');
        m_item_td2.setAttribute('class', 'uk-width-1-4 center uk-visible@m');
        let m_item_td3 = document.createElement('td');
        m_item_td3.setAttribute('class', 'uk-width-1-4 center uk-visible@m');
        let m_item_td4 = document.createElement('td');
        m_item_td4.setAttribute('class', 'uk-width-1-4 right uk-visible@m');
        let m_item_td5 = document.createElement('td');
        m_item_td5.setAttribute('class', 'uk-width-1-2 left uk-visible@xs uk-hidden@m');
        let m_item_td6 = document.createElement('td');
        m_item_td6.setAttribute('class', 'uk-width-1-2 right uk-visible@xs uk-hidden@m');

        let m_item_img1 = document.createElement('img');
        m_item_img1.setAttribute('src', '/img/png/chat-1.png');
        m_item_img1.setAttribute('onclick', `conversation('${m_timestamp}')`);
        m_item_img1.setAttribute('uk-toggle', 'target: #converse');
        m_item_img1.setAttribute('class', 'item');
        m_item_img1.setAttribute('title', 'Conversation');
        m_item_img1.setAttribute('alt', 'Conversation');

        let convo_num_span = document.createElement('span');
        convo_num_span.setAttribute('class', 'comm-num');
        convo_num_span.setAttribute('id', `comm-num-${m_timestamp}`);
        let convo_num_node = document.createTextNode(' 0');
        convo_num_span.appendChild(convo_num_node);

        let m_item_img2 = document.createElement('img');
        m_item_img2.setAttribute('src', '/img/png/edit.png');
        m_item_img2.setAttribute('class', 'item');
        m_item_img2.setAttribute('title', 'Edit');
        m_item_img2.setAttribute('alt', 'Edit');
        m_item_img2.setAttribute('onclick', `editMessage(true, '${m_timestamp}')`);

        let m_item_img3 = document.createElement('img');
        m_item_img3.setAttribute('src', '/img/png/garbage.png');
        m_item_img3.setAttribute('class', 'item');
        m_item_img3.setAttribute('title', 'Delete');
        m_item_img3.setAttribute('alt', 'Delete');
        m_item_img3.setAttribute('onclick', `deleteMessage('${m_timestamp}', 'm')`);

        let m_item_time_span1 = document.createElement('span');
        m_item_time_span1.setAttribute('class', 'item grey');
        let m_item_time_node1 = document.createTextNode(`${timeStamp} | ${dateStamp}`);
        m_item_time_span1.appendChild(m_item_time_node1);

        let m_item_time_span2 = document.createElement('span');
        m_item_time_span2.setAttribute('class', 'item grey');
        let m_item_time_node2 = document.createTextNode(`${timeStamp} | ${dateStamp}`);
        m_item_time_span2.appendChild(m_item_time_node2);

        let m_item_drop_div = document.createElement('div');
        m_item_drop_div.setAttribute('class', 'uk-inline');
        let m_item_drop_span = document.createElement('span');
        m_item_drop_span.setAttribute('uk-icon', 'icon: more-vertical');
        let m_item_dropdown = document.createElement('div');
        m_item_dropdown.setAttribute('uk-dropdown', 'pos: top-right; mode: click');
        let m_item_ul = document.createElement('ul');
        m_item_ul.setAttribute('class', 'uk-nav uk-dropdown-nav');
        let m_item_li1 = document.createElement('li');
        m_item_li1.setAttribute('uk-toggle', 'target: #converse');
        m_item_li1.setAttribute('onclick', `conversation('${m_timestamp}')`);
        let m_item_li1_text = document.createTextNode("Conversation");
        m_item_li1.appendChild(m_item_li1_text);
        let m_item_li2 = document.createElement('li');
        m_item_li2.setAttribute('onclick', `editMessage(true, '${m_timestamp}')`);
        let m_item_li2_text = document.createTextNode("Edit");
        m_item_li2.appendChild(m_item_li2_text);
        let m_item_li3 = document.createElement('li');
        m_item_li3.setAttribute('onclick', `deleteMessage('${m_timestamp}', 'm')`);
        let m_item_li3_text = document.createTextNode("Delete");
        m_item_li3.appendChild(m_item_li3_text);

        //appending to final td
        m_item_ul.appendChild(m_item_li1);
        m_item_ul.appendChild(m_item_li2);
        m_item_ul.appendChild(m_item_li3);
        m_item_dropdown.appendChild(m_item_ul);
        m_item_drop_div.appendChild(m_item_drop_span);
        m_item_drop_div.appendChild(m_item_dropdown);
        m_item_td6.appendChild(m_item_drop_div);

        //appending td content to tds
        m_item_td1.appendChild(m_item_img1);
        m_item_td1.appendChild(convo_num_span);
        m_item_td2.appendChild(m_item_img2);
        m_item_td3.appendChild(m_item_img3);
        m_item_td4.appendChild(m_item_time_span1);
        m_item_td5.appendChild(m_item_time_span2);

        //append to row
        m_info_tr.appendChild(m_item_td1);
        m_info_tr.appendChild(m_item_td2);
        m_info_tr.appendChild(m_item_td3);
        m_info_tr.appendChild(m_item_td4);
        m_info_tr.appendChild(m_item_td5);
        m_info_tr.appendChild(m_item_td6);
    }
    else {
        let m_item_td1 = document.createElement('td');
        m_item_td1.setAttribute('class', 'uk-width-1-3 center uk-visible@m');
        let m_item_td2 = document.createElement('td');
        m_item_td2.setAttribute('class', 'uk-width-1-3 center uk-visible@m');
        let m_item_td3 = document.createElement('td');
        m_item_td3.setAttribute('class', 'uk-width-1-4 right uk-visible@m');
        let m_item_td4 = document.createElement('td');
        m_item_td4.setAttribute('class', 'uk-width-1-2 left uk-visible@xs uk-hidden@m');
        let m_item_td5 = document.createElement('td');
        m_item_td5.setAttribute('class', 'uk-width-1-2 right uk-visible@xs uk-hidden@m');

        let m_item_img1 = document.createElement('img');
        m_item_img1.setAttribute('src', '/img/png/chat-1.png');
        m_item_img1.setAttribute('onclick', `conversation('${m_timestamp}')`);
        m_item_img1.setAttribute('uk-toggle', 'target: #converse');
        m_item_img1.setAttribute('class', 'item');
        m_item_img1.setAttribute('title', 'Conversation');
        m_item_img1.setAttribute('alt', 'Conversation');

        let convo_num_span = document.createElement('span');
        convo_num_span.setAttribute('class', 'comm-num');
        convo_num_span.setAttribute('id', `comm-num-${m_timestamp}`);
        let convo_num_node = document.createTextNode(' 0');
        convo_num_span.appendChild(convo_num_node);

        let m_item_img2 = document.createElement('img');
        m_item_img2.setAttribute('src', '/img/img-1/flag.png');
        m_item_img2.setAttribute('class', 'item');
        m_item_img2.setAttribute('title', 'Report');
        m_item_img2.setAttribute('alt', 'Report');
        m_item_img2.setAttribute('onclick', `reportMessage('${m_timestamp}', 'm')`);

        let m_item_time_span1 = document.createElement('span');
        m_item_time_span1.setAttribute('class', 'item grey');
        let m_item_time_node1 = document.createTextNode(`${timeStamp} | ${dateStamp}`);
        m_item_time_span1.appendChild(m_item_time_node1);

        let m_item_time_span2 = document.createElement('span');
        m_item_time_span2.setAttribute('class', 'item grey');
        let m_item_time_node2 = document.createTextNode(`${timeStamp} | ${dateStamp}`);
        m_item_time_span2.appendChild(m_item_time_node2);

        let m_item_drop_div = document.createElement('div');
        m_item_drop_div.setAttribute('class', 'uk-inline');
        let m_item_drop_span = document.createElement('span');
        m_item_drop_span.setAttribute('uk-icon', 'icon: more-vertical');
        let m_item_dropdown = document.createElement('div');
        m_item_dropdown.setAttribute('uk-dropdown', 'pos: top-right; mode: click');
        let m_item_ul = document.createElement('ul');
        m_item_ul.setAttribute('class', 'uk-nav uk-dropdown-nav');
        let m_item_li1 = document.createElement('li');
        m_item_li1.setAttribute('uk-toggle', 'target: #converse');
        m_item_li1.setAttribute('onclick', `conversation('${m_timestamp}')`);
        let m_item_li1_text = document.createTextNode("Conversation");
        m_item_li1.appendChild(m_item_li1_text);
        let m_item_li2 = document.createElement('li');
        m_item_li2.setAttribute('onclick', `reportMessage('${m_timestamp}', 'm')`);
        let m_item_li2_text = document.createTextNode("Report");
        m_item_li2.appendChild(m_item_li2_text);

        //appending to final td
        m_item_ul.appendChild(m_item_li1);
        m_item_ul.appendChild(m_item_li2);
        m_item_dropdown.appendChild(m_item_ul);
        m_item_drop_div.appendChild(m_item_drop_span);
        m_item_drop_div.appendChild(m_item_dropdown);
        m_item_td5.appendChild(m_item_drop_div);

        //appending td content to tds
        m_item_td1.appendChild(m_item_img1);
        m_item_td1.appendChild(convo_num_span);
        m_item_td2.appendChild(m_item_img2);
        m_item_td3.appendChild(m_item_time_span1);
        m_item_td4.appendChild(m_item_time_span2);

        //append to row
        m_info_tr.appendChild(m_item_td1);
        m_info_tr.appendChild(m_item_td2);
        m_info_tr.appendChild(m_item_td3);
        m_info_tr.appendChild(m_item_td4);
        m_info_tr.appendChild(m_item_td5);
    }

    m_info_table.appendChild(m_info_tr);

    //create text nodes
    if (originator) {
        var m_sender_text = document.createTextNode("You");
    }
    else {
        var m_sender_text = document.createTextNode(message.sender_name);
    }
    if (message.sender_position) {
        if(message.isNews){
            message.sender_position = `News | ${message.sender_position}`;
        }
        else {
            message.sender_position = `Opinion | ${message.sender_position}`;
        }
        var m_sender_p_text = document.createTextNode(message.sender_position);
    }

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

    //appending message info to div
    m_info.appendChild(m_info_table);

    //appending message to its containers
    m_td.appendChild(m_text);
    m_tr.appendChild(m_td);
    m_table.appendChild(m_tr);

    //appending four inner divs to message
    newMessage.appendChild(m_avatar);
    newMessage.appendChild(m_sender);
    newMessage.appendChild(m_table);
    newMessage.appendChild(m_info);

    if (!loc) {
        loc = 'messagesDiv';
    }
    let messagesDiv = document.getElementById(loc);
    let first = messagesDiv.firstChild;
    messagesDiv.insertBefore(newMessage, first);
}