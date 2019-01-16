//create variable to check whether there already exist comments for req'd message, so we know not to request server again
function conversation(m_id) {
    //clear
    document.getElementById('message-comm').innerHTML = '';
    document.getElementById('conversation').innerHTML = '';
    // request for message
    $.ajax({
        url: '/request-comments',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            m_timestamp: m_id
        }),
        error: () => {
            setErr("Error contacting server. Please check your Internet connection and try again");
        },
        success: (data) => {
            //message, comments, user. Precisely
            appendCMessage(data.message, data.user);
            data.comments.forEach(comment => {
                prependComment(comment, false, data.username);
            });
        }
    });
    // append message to modal
    // use fn below to pre or append the comments
}

function appendCMessage(message, user) {
    let mDiv = document.getElementById('message-comm');
    let m_text = message.message;
    let m_sender = message.sender;
    let m_sender_name = message.sender_name;
    let m_sender_position = message.sender_position;
    let m_avatar = message.sender_avatar;
    let m_verified = message.verified;
    let m_time = message.time_created;
    let m_date = message.date_created;

    let m_text_div = document.createElement('div');
    m_text_div.setAttribute('class', 'm-text');
    extractTags(m_text_div, m_text, message.tags.length);

    let m_text_table = document.createElement('table');
    let m_text_tr = document.createElement('tr');
    let m_text_td = document.createElement('td');
    m_text_td.setAttribute('class', 'mTextTD');

    //appending for the table
    m_text_td.appendChild(m_text_div);
    m_text_tr.appendChild(m_text_td);
    m_text_table.appendChild(m_text_tr);

    let u_username = null;
    let u_name = null;
    let u_avatar = null;
    let u_verified = null;

    //combining message
    let messageDiv = document.createElement('div');
    messageDiv.setAttribute('class', 'message uk-width-1-1 uk-card uk-card-default  uk-card-hover uk-card-body');
    let m_avatar_div = document.createElement('div');
    m_avatar_div.setAttribute('class', 'm-avatar');
    let m_avatar_img = document.createElement('img');
    m_avatar_img.setAttribute('src', '/' + m_avatar);
    m_avatar_img.setAttribute('class', 'm-avatar-img');
    m_avatar_img.setAttribute('alt', m_sender_name + "'s avatar");
    let m_sender_div = document.createElement('div');
    m_sender_div.setAttribute('class', 'm-sender');
    let m_sender_line_div = document.createElement('div');
    m_sender_line_div.setAttribute('class', 'm-sender-line');
    let m_sender_line_a = document.createElement('a');
    m_sender_line_a.setAttribute('href', '/profile/' + m_sender);
    let m_sender_verified_span = document.createElement('span');
    m_sender_verified_span.setAttribute('class', 'verified');
    let m_sender_verified_img = document.createElement('img');
    m_sender_verified_img.setAttribute('src', '/img/img-1/success.png');
    m_sender_verified_img.setAttribute('title', 'Verified User');
    m_sender_verified_img.setAttribute('alt', 'Verified User');
    let m_sender_position_div = document.createElement('div');
    m_sender_position_div.setAttribute('class', 'm-sender-line');
    //m-text
    let m_info_div = document.createElement('div');
    m_info_div.setAttribute('class', 'm-info right');
    let m_info_span = document.createElement('span');
    m_info_span.setAttribute('class', 'item grey');

    let m_sender_node = document.createTextNode(m_sender_name);

    if (m_sender_position) {
        if (message.isNews) {
            m_sender_position = `News | ${message.sender_position}`;
        }
        else {
            m_sender_position = `Opinion | ${message.sender_position}`;
        }
    }
    let m_sender_position_node = document.createTextNode(m_sender_position);

    let m_info_node = document.createTextNode(m_time + ' | ' + m_date);

    m_avatar_div.appendChild(m_avatar_img);
    m_sender_line_a.appendChild(m_sender_node);
    m_sender_line_div.appendChild(m_sender_line_a);
    if (m_verified) {
        m_sender_verified_span.appendChild(m_sender_verified_img);
        m_sender_line_div.appendChild(m_sender_verified_span);
    }
    m_sender_position_div.appendChild(m_sender_position_node);
    m_sender_div.appendChild(m_sender_line_div);
    if (m_sender_position) {
        m_sender_div.appendChild(m_sender_position_div);
    }
    m_info_span.appendChild(m_info_node);
    m_info_div.appendChild(m_info_span);

    messageDiv.appendChild(m_avatar_div);
    messageDiv.appendChild(m_sender_div);
    messageDiv.appendChild(m_text_table);
    messageDiv.appendChild(m_info_div);

    mDiv.appendChild(messageDiv);

    //combining user props
    if (user) {
        u_username = user.username;
        u_name = user.name;
        u_avatar = user.avatar;
        u_verified = user.verified;

        let u_c_div = document.createElement('div');
        u_c_div.setAttribute('class', 'join-convo');
        let u_c_h = document.createElement('h4');
        u_c_h.setAttribute('class', 'center grey');
        let u_c_comm_div = document.createElement('div');
        u_c_comm_div.setAttribute('class', 'cr-comment');
        let u_c_avatar_div = document.createElement('div');
        u_c_avatar_div.setAttribute('class', 'c-avatar');
        let u_c_avatar_img = document.createElement('img');
        u_c_avatar_img.setAttribute('src', '/' + u_avatar);
        u_c_avatar_img.setAttribute('class', 'c-avatar-img');
        u_c_avatar_img.setAttribute('alt', 'avatar');
        let u_c_text_div = document.createElement('div');
        u_c_text_div.setAttribute('class', 'c-text');
        let u_c_textarea = document.createElement('textarea');
        u_c_textarea.setAttribute('name', 'comment');
        u_c_textarea.setAttribute('id', 'user-comment');
        u_c_textarea.setAttribute('class', 'user-comment');
        u_c_textarea.setAttribute('placeholder', 'Enter Comment...');
        let u_c_btn_div = document.createElement('div');
        u_c_btn_div.setAttribute('class', 'center');
        let u_c_btn = document.createElement('button');
        u_c_btn.setAttribute('id', 'c-btn');
        u_c_btn.setAttribute('class', 'c-btn');
        u_c_btn.setAttribute('onclick', `postComment('${message.m_timestamp}', 'm')`);

        let u_c_h_node = document.createTextNode("Join Conversation");
        let u_c_btn_node = document.createTextNode("Post Comment");

        u_c_h.appendChild(u_c_h_node);
        u_c_btn.appendChild(u_c_btn_node);
        u_c_avatar_div.appendChild(u_c_avatar_img);
        u_c_btn_div.appendChild(u_c_btn);
        u_c_comm_div.appendChild(u_c_avatar_div);
        u_c_text_div.appendChild(u_c_textarea)
        u_c_text_div.appendChild(u_c_btn_div);
        u_c_comm_div.appendChild(u_c_text_div);
        u_c_div.appendChild(u_c_h);
        u_c_div.appendChild(u_c_comm_div);

        mDiv.appendChild(u_c_div);
    }
}

function prependComment(comment, first, username) {
    let cDiv = document.getElementById('conversation');

    let c_text = comment.comment;
    let c_sender = comment.sender;
    let c_sender_name = comment.sender_name;
    let c_sender_avatar = comment.sender_avatar;
    let c_timestamp = comment.c_timestamp;
    let date_created = comment.date_created;
    let time_created = comment.time_created;
    let isUser = comment.isUser;

    if (username == c_sender) {
        c_sender_name = "You";
    }
    let c_text_div = document.createElement('div');
    c_text_div.setAttribute('class', 'c-text');
    c_text_div.setAttribute('id', `c-text-${c_timestamp}`);
    extractTags(c_text_div, c_text, comment.tags.length);

    let c_text_td = document.createElement('td');
    c_text_td.setAttribute('class', 'cTextTD');
    let c_text_tr = document.createElement('tr');
    let c_text_table = document.createElement('table');

    c_text_td.appendChild(c_text_div);
    c_text_tr.appendChild(c_text_td);
    c_text_table.appendChild(c_text_tr);

    let c_div = document.createElement('div');
    c_div.setAttribute('class', 'comment uk-width-1-1 uk-card uk-card-default  uk-card-hover uk-card-body');
    c_div.setAttribute('id', c_timestamp);
    let c_avatar_div = document.createElement('div');
    c_avatar_div.setAttribute('class', 'c-avatar');
    let c_avatar_img = document.createElement('img');
    c_avatar_img.setAttribute('src', '/' + c_sender_avatar);
    c_avatar_img.setAttribute('class', 'c-avatar-img');
    c_avatar_img.setAttribute('alt', c_sender_name + '\'s avatar');
    let c_sender_div = document.createElement('div');
    c_sender_div.setAttribute('class', 'c-sender');
    let c_sender_name_div = document.createElement('div');
    c_sender_name_div.setAttribute('class', 'c-sender-line');
    let c_sender_name_a = document.createElement('a');
    c_sender_name_a.setAttribute('href', '/profile/' + c_sender);
    //c-text
    let c_info_div = document.createElement('div');
    c_info_div.setAttribute('class', 'c-info');
    let c_info_span = document.createElement('span');
    c_info_span.setAttribute('class', 'item grey');
    let c_edit_span = document.createElement('span');
    c_edit_span.setAttribute('class', 'item item-img');
    let c_delete_span = document.createElement('span');
    c_delete_span.setAttribute('class', 'item item-img');
    let c_report_span = document.createElement('span');
    c_report_span.setAttribute('class', 'item item-img');

    let c_sender_node = document.createTextNode(c_sender_name);
    let c_edit_img = document.createElement('img');
    c_edit_img.setAttribute('src', '/img/png/edit.png');
    c_edit_img.setAttribute('alt', 'Edit');
    c_edit_img.setAttribute('title', 'Edit');
    c_edit_img.setAttribute('onclick', `editMessage(false, '${c_timestamp}')`);
    let c_delete_img = document.createElement('img');
    c_delete_img.setAttribute('src', '/img/png/garbage.png');
    c_delete_img.setAttribute('alt', 'Delete');
    c_delete_img.setAttribute('title', 'Delete');
    c_delete_img.setAttribute('onclick', `deleteMessage('${c_timestamp}', 'c')`);
    let c_report_img = document.createElement('img');
    c_report_img.setAttribute('src', '/img/img-1/flag-3.png');
    c_report_img.setAttribute('alt', 'Report');
    c_report_img.setAttribute('title', 'Report');
    c_report_img.setAttribute('onclick', `reportMessage('${c_timestamp}', 'c')`);
    let c_info_node = document.createTextNode(time_created + ' | ' + date_created);

    c_avatar_div.appendChild(c_avatar_img);
    c_sender_name_a.appendChild(c_sender_node);
    c_sender_name_div.appendChild(c_sender_name_a);

    //create info table and row
    let c_info_table = document.createElement('table');
    let c_info_tr = document.createElement('tr');

    if (username == c_sender) {
        c_edit_span.appendChild(c_edit_img);
        let c_edit_td = document.createElement('td');
        c_edit_td.setAttribute('class', 'uk-width-1-4 center');
        c_edit_td.appendChild(c_edit_span);
        c_delete_span.appendChild(c_delete_img);
        let c_delete_td = document.createElement('td');
        c_delete_td.setAttribute('class', 'uk-width-1-4 center');
        c_delete_td.appendChild(c_delete_span);
        c_info_tr.appendChild(c_edit_td);
        c_info_tr.appendChild(c_delete_td);
    }
    else {
        c_report_span.appendChild(c_report_img);
        let c_report_td = document.createElement('td');
        c_report_td.setAttribute('class', 'uk-width-1-4 center');
        c_report_td.appendChild(c_report_span);
        c_info_tr.appendChild(c_report_td);
    }
    c_sender_div.appendChild(c_sender_name_div);
    c_info_span.appendChild(c_info_node);
    let c_info_td = document.createElement('td');
    c_info_td.setAttribute('class', 'uk-width-1-4 right');
    c_info_td.appendChild(c_info_span);
    c_info_tr.appendChild(c_info_td);

    c_info_table.appendChild(c_info_tr);
    c_info_div.appendChild(c_info_table);

    c_div.appendChild(c_avatar_div);
    c_div.appendChild(c_sender_div);
    c_div.appendChild(c_text_table);
    c_div.appendChild(c_info_div);

    cDiv.appendChild(c_div);
}

function postComment(m_timestamp, c_type) {
    let comment = document.getElementById('user-comment').value;
    $.ajax({
        url: '/comments/post',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            comment: comment,
            m_timestamp: m_timestamp,
            c_type: c_type
        }),
        error: () => {
            setErr("An error occured posting your comment. Please check your Internet connection and try again");
        },
        success: (data) => {
            prependComment(data.comment, true, data.username);
            document.getElementById('user-comment').value = '';
            let num = document.getElementById(`comm-num-${m_timestamp}`).textContent;
            num = parseInt(num);
            num++;
            document.getElementById(`comm-num-${m_timestamp}`).textContent = num;
        }
    });
}
let openEdit = false;
function editMessage(message, timestamp) {
    if (document.getElementById('m-textarea-' + timestamp) || document.getElementById('c-textarea-' + timestamp)) {
        openEdit = true;
    }
    else {
        openEdit = false;
    }
    if (!openEdit) {
        openEdit = true;
        if (message) {
            let m_text_div = document.getElementById(`m-text-${timestamp}`);
            if (m_text_div) {
                let m_html = m_text_div.innerHTML;
                let m_text = m_text_div.innerText;
                let m_textarea = document.createElement('textarea');
                m_textarea.setAttribute('class', 'user-comment');
                m_textarea.setAttribute('id', `m-textarea-${timestamp}`);
                m_textarea.value = m_text;
                let m_wrapper = document.createElement('div');
                let btn_div = document.createElement('div');
                btn_div.setAttribute('class', 'right');
                let update_btn = document.createElement('button');
                update_btn.setAttribute('class', 'c-btn');
                let btn_text = document.createTextNode("Update Post");
                update_btn.setAttribute('onclick', `updateMessage('${timestamp}', true)`);
                let cancel_btn = document.createElement('button');
                cancel_btn.setAttribute('class', 'c-btn');
                cancel_btn.setAttribute('onclick', `revert('${timestamp}', true, \`${m_html}\`)`);
                let c_btn_text = document.createTextNode("Cancel");
                update_btn.appendChild(btn_text);
                btn_div.appendChild(update_btn);
                cancel_btn.appendChild(c_btn_text);
                btn_div.appendChild(cancel_btn);
                m_wrapper.appendChild(m_textarea);
                m_wrapper.appendChild(btn_div);
                m_text_div.innerHTML = '';
                m_text_div.appendChild(m_wrapper);
            }
        }
        else {
            let c_text_div = document.getElementById(`c-text-${timestamp}`);
            if (c_text_div) {
                let c_html = c_text_div.innerHTML;
                let c_text = c_text_div.textContent;
                let c_textarea = document.createElement('textarea');
                c_textarea.setAttribute('class', 'user-comment');
                c_textarea.setAttribute('id', `c-textarea-${timestamp}`);
                c_textarea.value = c_text;
                let c_wrapper = document.createElement('div');
                let btn_div = document.createElement('div');
                btn_div.setAttribute('class', 'right');
                let update_btn = document.createElement('button');
                update_btn.setAttribute('class', 'c-btn');
                update_btn.setAttribute('onclick', `updateMessage('${timestamp}', false)`);
                let cancel_btn = document.createElement('button');
                cancel_btn.setAttribute('class', 'c-btn');
                cancel_btn.setAttribute('onclick', `revert('${timestamp}', false, \`${c_html}\`)`);
                let btn_text = document.createTextNode("Update Comment");
                let c_btn_text = document.createTextNode("Cancel");
                update_btn.appendChild(btn_text);
                cancel_btn.appendChild(c_btn_text);
                btn_div.appendChild(update_btn);
                btn_div.appendChild(cancel_btn);

                c_wrapper.appendChild(c_textarea);
                c_wrapper.appendChild(btn_div);
                c_text_div.innerHTML = '';
                c_text_div.appendChild(c_wrapper);
            }
        }
    }
}

function clearErr() {
    setTimeout(() => {
        document.getElementById('errorDiv').textContent = '';
    }, 5000);
}

function setErr(text) {
    document.getElementById('errorDiv').textContent = text;
    clearErr();
}

function revert(timestamp, message, init_html) {
    if (message) {
        let m_text_div = document.getElementById(`m-text-${timestamp}`);
        m_text_div.innerHTML = '';
        m_text_div.innerHTML = init_html;
        openEdit = false;
    }
    else {
        let c_text_div = document.getElementById(`c-text-${timestamp}`);
        c_text_div.innerHTML = '';
        c_text_div.innerHTML = init_html;
        openEdit = false;
    }
}

function updateMessage(timestamp, message) {
    if (message) {
        let m_text = document.getElementById(`m-textarea-${timestamp}`).value;
        $.ajax({
            url: '/edit/message/' + timestamp,
            method: 'POST',
            contentType: 'application/JSON',
            data: JSON.stringify({
                m_text: m_text
            }),
            error: () => {
                setErr("An error occured in editing your message. Please check your Internet connection and try again.");
            },
            success: (data) => {
                if (data.success) {
                    //destroy initial element
                    //prepend
                    let m_text_div = document.getElementById(`${timestamp}`);
                    if (m_text_div) {
                        m_text_div.innerHTML = '';
                        m_text_div.classList += ' hidden';
                        appendMessage(data.message, data.originator);
                    }
                }
                else {
                    setErr("An error occured in editing your message. Try again.");
                }
            }
        });
    }
    else {
        let m_text = document.getElementById(`c-textarea-${timestamp}`).value;
        $.ajax({
            url: '/edit/comment/' + timestamp,
            method: 'POST',
            contentType: 'application/JSON',
            data: JSON.stringify({
                m_text: m_text
            }),
            error: () => {
                setErr("An error occured in editing your message. Please check your Internet connection and try again.");
            },
            success: (data) => {
                if (data.success) {
                    //destroy initial element
                    //prepend
                    let c_text_div = document.getElementById(`${timestamp}`);
                    if (c_text_div) {
                        c_text_div.innerHTML = '';
                        c_text_div.classList += ' hidden';
                        prependComment(data.comment, true, data.username);
                    }
                }
                else {
                    setErr("An error occured in editing your message. Try again.");
                }
            }
        });
    }
}

function deleteMessage(timestamp, m_type) {
    let confMessage = "Are you sure you want to delete this Post?";
    if (m_type === 'c') {
        confMessage = "Are you sure you want to delete this Comment?";
    }
    let confirmed = confirm(confMessage);
    if (confirmed) {
        $.ajax({
            url: '/delete/' + m_type + '/' + timestamp,
            method: 'POST',
            error: () => {
                setErr("An error occured deleting your message. Try again");
            },
            success: (data) => {
                if (data.success) {
                    document.getElementById(timestamp).innerHTML = '';
                    document.getElementById(timestamp).classList += ' hidden';
                    if (m_type == 'c') {
                        let m_timestamp = data.m_timestamp;
                        let num = document.getElementById(`comm-num-${m_timestamp}`).textContent;
                        num = parseInt(num);
                        num--;
                        document.getElementById(`comm-num-${m_timestamp}`).textContent = num;
                    }
                }
                else {
                    setErr("You do not have adequate permissions to delete this message");
                }
            }
        });
    }
}

function reportMessage(timestamp, m_type) {
    let confMessage = "Do you want to report this Message for a Community violation?";
    if (m_type === 'c') {
        confMessage = "Do you want to report this Comment for a Community violation?"
    }
    let confirmed = confirm(confMessage);
    if (confirmed) {
        $.ajax({
            url: '/report/' + m_type + '/' + timestamp,
            method: 'POST',
            error: () => {
                setErr("An error occured in reporting the message. Please check your Internet connection");
            },
            success: (data) => {
                if (data.success) {
                    setErr("We appreciate you taking out time to report this message. Our Community Moderators will have a look at it and take action where necessary. Thank you.");
                }
                else {
                    setErr("An error occured in reporting the message. Please refresh your feed");
                }
            }
        });
    }
}