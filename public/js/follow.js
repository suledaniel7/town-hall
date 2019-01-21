function follow(username) {
    $.ajax({
        url: '/follow/' + username,
        method: 'POST',
        error: () => {
            setErr("An error occured connecting to the Server. Please check your Internet connection");
        },
        success: (data) => {
            if (data.success) {
                //change follow btn
                document.getElementById('followBtn').classList += ' hidden';
                let btn = document.createElement('button');
                btn.setAttribute('id', 'unfollowBtn');
                btn.setAttribute('class', 'followBtn');
                btn.setAttribute('onclick', `unfollow('${username}');`);
                let btnText = document.createTextNode("Unfollow");
                btn.appendChild(btnText);
                document.getElementsByClassName('follow')[0].innerHTML = '';
                document.getElementsByClassName('follow')[0].appendChild(btn);
                updateFNum(true);
            }
            else {
                setErr(data.text);
            }
        }
    });
}

function unfollow(username) {
    $.ajax({
        url: '/unfollow/' + username,
        method: 'POST',
        error: () => {
            setErr("An error occured connecting to the Server. Please check your Internet connection");
        },
        success: (data) => {
            if (data.success) {
                //change follow btn
                document.getElementById('unfollowBtn').classList += ' hidden';
                let btn = document.createElement('button');
                btn.setAttribute('id', 'followBtn');
                btn.setAttribute('class', 'followBtn');
                btn.setAttribute('onclick', `follow('${username}');`);
                let btnText = document.createTextNode("Follow");
                btn.appendChild(btnText);
                document.getElementsByClassName('follow')[0].innerHTML = '';
                document.getElementsByClassName('follow')[0].appendChild(btn);
                updateFNum(false);
            }
            else {
                setErr(data.text);
            }
        }
    });
}

function updateFNum(increment) {
    let f_num = document.getElementById('follCount');
    if (f_num) {
        let f_num_text = f_num.innerText;
        f_num_text = parseInt(f_num_text);
        if (increment) {
            f_num_text++;
        }
        else {
            f_num_text--;
        }
        f_num.innerText = f_num_text;
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