const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cors = require('cors');
const favicon = require('serve-favicon');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const router = require('./server/router');
const api = require('./server/api');
const socketFn = require('./server/socket');

app.use(cors());

mongoose.connect('mongodb://127.0.0.1/town_hall').catch((reason) => {
    console.log(`Couldn't connect to MongoDB. Reason: ${reason}`);
});

io.on('connection', (socket) => {
    socketFn('save_auth', socket.conn.remoteAddress).then((username) => {
        if (username) {
            socket.join(username);
        }
    }).catch(ret_e => {
        console.log(ret_e);
    });

    socket.on('message_sent', (data) => {
        socketFn('message_sent', data).then((ret_d) => {
            if (ret_d) {
                let audience = ret_d.audience;
                let ret_m = ret_d.message;
                io.in(ret_d.username).emit('self_message', ret_m);
                if (audience) {
                    if (audience.length > 0) {
                        for (let i = 0; i < audience.length; i++) {
                            let person = audience[i];
                            io.in(person.username).emit('msg', { page: person.pg, message: ret_m });
                        }
                    }
                }
            }
        }).catch((ret_e) => {
            console.log(ret_e);
        });
    });

    socket.on('j_request', (data) => {
        socketFn('j_request', data).then((ret_d) => {
            if (ret_d) {
                let found = ret_d.found;
                let o_username = data.o_username;
                if (found) {
                    io.in(o_username).emit('j_req', { page: 'j', journo: ret_d.journo });
                }
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('accept_j', (data) => {
        socketFn('accept_j', data).then((ret_d) => {
            if (ret_d) {
                if (ret_d.found) {
                    let journalist = ret_d.journo;
                    let o_username = journalist.organisation;
                    io.in(o_username).emit('new_j', { page: 'j', journo: journalist });
                }
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('changed_profile', (data) => {
        let timestamp = data;
        let index = timestamp.indexOf('-');
        if (index !== -1) {
            data = { username: timestamp.slice(0, index) };
        }
        else {
            data = { username: data }
        }
        socketFn('changed_profile', data).then((ret_d) => {
            if (ret_d) {
                io.in(data.username).emit('profile_changed', { page: 'p', newUser: ret_d });
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('assign_j', (username) => {
        socketFn('assign_j', username).then((data) => {
            if (data) {
                io.in(username).emit('j_assigned', { beat: data });
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('follow', () => {
        let ip = socket.conn.remoteAddress;
        socketFn('follow', { ip: ip }).then((data) => {
            if (data) {
                let username = data.username;
                let messages = data.msgs;
                let selected = data.selected;
                if(!selected){
                    selected = false;
                }

                io.in(username).emit('following', { page: 'h', messages: messages, selected: selected });
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('j_rej', (data) => {
        let username = data.username;
        io.in(username).emit('rej_j');
    });

    socket.on('j_rem', (data) => {
        let username = data.username;
        io.in(username).emit('rem_j');
    });

    socket.on('j_acc', (data) => {
        let username = data.username;
        io.in(username).emit('acc_j');
    });

    socket.on('ch_org', (data) => {
        let username = data.username;
        let org = data.org;
        let init = data.init_org;
        socketFn('ch_org', data).then((ret_d) => {
            if (ret_d) {
                io.in(org).emit('j_req', { page: 'j', journo: ret_d });
            }
            io.in(init).emit('rem_req', username);
            io.in(init).emit('j_removed', username);
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('edit', (data) => {
        socketFn('edit', data).then((ret_d) => {
            if (ret_d) {
                let audience = ret_d.audience;
                let ret_m = ret_d.message;
                if (audience) {
                    if (audience.length > 0) {
                        for (let i = 0; i < audience.length; i++) {
                            let person = audience[i];
                            io.in(person.username).emit('edited', { page: person.pg, message: ret_m });
                        }
                    }
                }
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('new_j_post', () => {
        let ip = socket.conn.remoteAddress;
        socketFn('new_j_post', ip).then(ret_d => {
            if (ret_d) {
                let username = ret_d.username;
                let org = ret_d.org;

                io.in(org).emit('j_post', username);
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('comment', (data) => {
        socketFn('comment', data).then((ret_d) => {
            if (ret_d) {
                io.emit('comment_count', ret_d);
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('deletion', (data) => {
        let timestamp = data.timestamp;
        let sender = data.sender;
        socketFn('deletion', data).then((ret_d) => {
            if (ret_d) {
                let audience = ret_d.audience;
                io.in(sender).emit('deletion_comp', { page: ['p', 'h'], timestamp: timestamp });
                if (audience.length > 0) {
                    for (let i = 0; i < audience.length; i++) {
                        let person = audience[i];
                        io.in(person.username).emit('deletion_comp', { page: person.pg, timestamp: timestamp });
                    }
                }
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('recompile', (data) => {
        let username = data.username;
        socketFn('recompile', data).then((ret_d) => {
            if (ret_d) {
                let messages = ret_d.msgs;
                let selected = ret_d.selected;
                if(!selected){
                    selected = false;
                }
                io.in(username).emit('recompiled', { messages: messages, selected: selected });
            }
        }).catch(ret_e => {
            console.log(ret_e);
        });
    });

    socket.on('dm', (data)=> {
        let dm = data.dm;
        let recepient = data.recepient;

        io.in(recepient).emit('new_dm', dm);
    });
});
app.use(express.static(__dirname + '/public/'));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');

app.use('/', router);
app.use('/api', api);

http.listen(8095, () => {
    console.log("Server running at http://127.0.0.1:8095");
});