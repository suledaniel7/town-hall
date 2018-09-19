//create variable to check whether there already exist comments for req'd message, so we know not to request server again
function conversation(m_id){
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
        error: ()=>{
            setErr("Error contacting server. Please check your Internet connection and try again");
        },
        success: (data)=>{
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

function appendCMessage(message, user){
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

    let u_username = null;
    let u_name = null;
    let u_avatar = null;
    let u_verified = null;

    //combining message
    let messageDiv = document.createElement('div');
    messageDiv.setAttribute('class', 'message');
    let m_avatar_div = document.createElement('div');
    m_avatar_div.setAttribute('class', 'm-avatar');
    let m_avatar_img = document.createElement('img');
    m_avatar_img.setAttribute('src', '/'+m_avatar);
    m_avatar_img.setAttribute('class', 'm-avatar-img');
    m_avatar_img.setAttribute('alt', m_sender_name+"'s avatar");
    let m_sender_div = document.createElement('div');
    m_sender_div.setAttribute('class', 'm-sender');
    let m_sender_line_div = document.createElement('div');
    m_sender_line_div.setAttribute('class', 'm-sender-line');
    let m_sender_line_a = document.createElement('a');
    m_sender_line_a.setAttribute('href', '/profile/'+m_sender);
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
    let m_sender_position_node = document.createTextNode(m_sender_position);
    let m_info_node = document.createTextNode(m_time + ' | ' + m_date);

    m_avatar_div.appendChild(m_avatar_img);
    m_sender_line_a.appendChild(m_sender_node);
    m_sender_line_div.appendChild(m_sender_line_a);
    if(m_verified){
        m_sender_verified_span.appendChild(m_sender_verified_img);
        m_sender_line_div.appendChild(m_sender_verified_span);
    }
    m_sender_position_div.appendChild(m_sender_position_node);
    m_sender_div.appendChild(m_sender_line_div);
    if(m_sender_position){
        m_sender_div.appendChild(m_sender_position_div);
    }
    m_info_span.appendChild(m_info_node);
    m_info_div.appendChild(m_info_span);

    messageDiv.appendChild(m_avatar_div);
    messageDiv.appendChild(m_sender_div);
    messageDiv.appendChild(m_text_div);
    messageDiv.appendChild(m_info_div);

    mDiv.appendChild(messageDiv);

    //combining user props
    if(user){
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
        u_c_avatar_img.setAttribute('src', '/'+u_avatar);
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

function prependComment(comment, first, username){
    let cDiv = document.getElementById('conversation');

    let c_text = comment.comment;
    let c_sender = comment.sender;
    let c_sender_name = comment.sender_name;
    let c_sender_avatar = comment.sender_avatar;
    let c_timestamp = comment.c_timestamp;
    let date_created = comment.date_created;
    let time_created = comment.time_created;
    let isUser = comment.isUser;

    if(username == c_sender){
        c_sender_name = "You";
    }
    let c_text_div = document.createElement('div');
    c_text_div.setAttribute('class', 'c-text');
    extractTags(c_text_div, c_text, comment.tags.length);

    let c_div = document.createElement('div');
    c_div.setAttribute('class', 'comment');
    let c_avatar_div = document.createElement('div');
    c_avatar_div.setAttribute('class', 'c-avatar');
    let c_avatar_img = document.createElement('img');
    c_avatar_img.setAttribute('src', '/'+c_sender_avatar);
    c_avatar_img.setAttribute('class', 'c-avatar-img');
    c_avatar_img.setAttribute('alt', c_sender_name+'\'s avatar');
    let c_sender_div = document.createElement('div');
    c_sender_div.setAttribute('class', 'c-sender');
    let c_sender_name_div = document.createElement('div');
    c_sender_name_div.setAttribute('class', 'c-sender-line');
    let c_sender_name_a = document.createElement('a');
    c_sender_name_a.setAttribute('href', '/profile/'+c_sender);
    //c-text
    let c_info_div = document.createElement('div');
    c_info_div.setAttribute('class', 'c-info right');
    let c_info_span = document.createElement('span');
    c_info_span.setAttribute('class', 'item grey');

    let c_sender_node = document.createTextNode(c_sender_name);
    let c_info_node = document.createTextNode(time_created + ' | ' + date_created);

    c_avatar_div.appendChild(c_avatar_img);
    if(!isUser){
        c_sender_name_a.appendChild(c_sender_node);
        c_sender_name_div.appendChild(c_sender_name_a);
    }
    else {
        c_sender_name_div.appendChild(c_sender_node);
    }
    c_sender_div.appendChild(c_sender_name_div);
    c_info_span.appendChild(c_info_node);
    c_info_div.appendChild(c_info_span);

    c_div.appendChild(c_avatar_div);
    c_div.appendChild(c_sender_div);
    c_div.appendChild(c_text_div);
    c_div.appendChild(c_info_div);

    cDiv.appendChild(c_div);
}

function postComment(m_timestamp, c_type){
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
        error: ()=>{
            setErr("An error occured posting your comment. Please check your Internet connection and try again");
        },
        success: (data)=>{
            prependComment(data.comment, true, data.username);
            document.getElementById('user-comment').value = '';
            let num = document.getElementById(`comm-num-${m_timestamp}`).textContent;
            num = parseInt(num);
            num++;
            document.getElementById(`comm-num-${m_timestamp}`).textContent = num;
        }
    });
}

function clearErr(){
    setTimeout(()=>{
        document.getElementById('errorDiv').textContent = '';
    }, 5000);
}

function setErr(text){
    document.getElementById('errorDiv').textContent = text;
    clearErr();
}